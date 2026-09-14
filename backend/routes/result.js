import express from "express";
import CandidateExam from "../models/CandidateExam.js";
import Result from "../models/Results.js";
import { authenticate, authorize } from "../middleware/auth.js";
import Exam from "../models/Exams.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const router = express.Router();

// Get list of Exams i have taken
router.get("/candidate/my-results", authenticate, authorize("candidate"), async (req, res) => {
    try {
        const candidateId = req.user.userId;
        const organizationId = req.user.organizationId;

        const candidateResults = await Result.find({
            candidate: candidateId,
            organizationId,
        }).populate("exam");

        const totalResultCount = candidateResults.length;

        // Check if any result found
        if(!candidateResults) {
            return res.status(404).json({ success: false, message: "Results not found!" });
        }

        res.json({
            success: true,
            data: {
                candidateResults: candidateResults,
                totalResultCount: totalResultCount
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get my result of a particular exam - candidates only
router.get("/:resultId", authenticate, authorize("candidate", "admin", "examiner"), async (req, res) => {
    try {
        const { resultId } = req.params;
        const candidateId = req.user.userId;
        const organizationId = req.user.organizationId;

        // Get the result
        const result = await Result.findById(resultId).populate("exam").populate("candidate");

        if (!result) {
            return res.status(404).json({ success: false, message: "Result not found." });
        }

        res.json({
            success: true,
            data: {
                result,
                // examTitle: result.exam.title,
                // numberOfQuestions: result.exam.numberOfQuestions,
                // duration: result.exam.duration,
                // passingMark: result.exam.passingMark,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// ===========================================
// ADMIN RESULT ROUTES
// ===========================================

// Get Result stats for an exam
router.get("/exam/:examId/stats", authenticate, authorize("admin"), async (req, res) => {
    try {
        const { examId } = req.params;
        const organizationId = req.user.organizationId;

        // Check if exam exists
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ success: false, message: "Exam not found." });
        }

        // Get the result stats
        const resultStats = await Result.aggregate([
            {
                $match: {
                    exam: new mongoose.Types.ObjectId(examId),
                    organizationId: new mongoose.Types.ObjectId(organizationId),
                },
            },
            {
                $group: {
                    _id: "$exam",
                    totalCandidates: { $sum: 1 },
                    totalPassed: { $sum: { $cond: [{ $eq: ["$passed", true] }, 1, 0] } },
                    totalFailed: { $sum: { $cond: [{ $eq: ["$passed", false] }, 1, 0] } },
                },
            },
        ]);

        res.json({
            success: true,
            data: {
                exam: exam.title,
                // resultStats,
                totalCandidates: resultStats[0]?.totalCandidates || 0,
                totalPassed: resultStats[0]?.totalPassed || 0,
                totalFailed: resultStats[0]?.totalFailed || 0,
                
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all results of candidates for an exam - add search by term, ranNo, paginate with limit of 10 and filter by submitted status
router.get("/exam/:examId/all", authenticate, authorize("admin"), async (req, res) => {
    try {
        const { examId } = req.params;
        const { search, submitted } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Check if exam exists
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ success: false, message: "Exam not found." });
        }

        // Build query based on filters
        const query = {
            exam: examId,
            organizationId: req.user.organizationId,
        };

        // Search by candidate name or ranNo
        if (search) {
            const candidates = await User.find({
                name: { $regex: search, $options: "i" },
            });
            query.$or = [
                { ranNo: { $regex: search, $options: "i" } },
                { candidate: { $in: candidates.map((c) => c._id) } },
            ];
        }

        if (submitted) {
            query.isSubmitted = submitted;
        }

        const results = await Result.find(query)
            .populate("candidate")
            .skip(skip)
            .limit(limit)
            .sort({createdAt: -1}); // descending order - newest results first

        // Get total count for pagination metadata
        const total = await Result.countDocuments(query);

        res.json({
            success: true,
            data: {
                examTitle: exam.title,
                results: results,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Generate Broadsheet of an exam
router.get("/exam/broadsheet/:examId", authenticate, authorize("admin"), async (req, res) => {
    try {
        const { examId } = req.params;
        const organizationId = req.user.organizationId;

        // Check if exam exists
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ success: false, message: "Exam not found." });
        }

        // Get all results of candidates for this exam
        const results = await Result.find({
            exam: examId,
            organizationId: organizationId,
        }).populate("candidate", "name ranNo conference");

        // create an array of objects from the results
        const broadsheet = results.map((result, index) => ({
            sn: index + 1,
            ranNo: result.candidate.ranNo,
            name: result.candidate.name,
            score: result.percentage,
            status: result.passed ? "PASS" : "FAIL",
        }));

        res.json({
            success: true,
            data: {
                examTitle: exam.title,
                results: broadsheet,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// // Get list of candidates who have written exam for an exam - add search by term, ranNo, paginate with limit of 10 and filter by passed/failed status - admins only
// router.get("/exam/:examId", authenticate, authorize("admin"), async (req, res) => {
//     try {
//         const { examId } = req.params;
//         const { term, passed } = req.query;
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;

//         // Build query based on filters
//         const query = {
//             exam: examId,
//             organizationId: req.user.organizationId,
//             isSubmitted: true,
//         };

//         if (term) {
//             // Search in candidate name, ranNo
//             query.$or = [
//                 { "candidate.name": { $regex: term, $options: "i" } },
//                 { "organizationId.name": { $regex: term, $options: "i" } },
//             ];
//         }

//         if (passed) {
//             query.passed = passed;
//         }

//         const candidateExams = await CandidateExam.find(query)
//             .populate("candidate")
//             .skip(skip)
//             .limit(limit);

//         // Get total count for pagination metadata
//         const total = await CandidateExam.countDocuments(query);

//         res.json({
//             success: true,
//             data: {
//                 candidateExams: candidateExams,
//                 pagination: {
//                     total,
//                     page,
//                     limit,
//                     totalPages: Math.ceil(total / limit),
//                 },
//             },
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

/**
 * @swagger
 * tags:
 *   - name: Results
 *     description: Candidate and admin result endpoints
 *
 * /api/result/candidate/my-results:
 *   get:
 *     tags:
 *       - Results
 *     summary: Get exams the authenticated candidate has taken
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Candidate exam list returned
 *
 * /api/result/{examId}:
 *   get:
 *     tags:
 *       - Results
 *     summary: Get a candidate's result for a specific exam
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Result returned successfully
 *       404:
 *         description: Result not found
 *
 * /api/result/all/{examId}:
 *   get:
 *     tags:
 *       - Results
 *     summary: Get all candidate results for an exam as an admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *       - in: query
 *         name: submitted
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Result list returned successfully
 *
 * /api/result/exam/{examId}:
 *   get:
 *     tags:
 *       - Results
 *     summary: Get candidate exam entries for an exam as an admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *       - in: query
 *         name: passed
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Candidate exams list returned successfully
 */
export default router;