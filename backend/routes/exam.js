import express from "express";
import Exam from "../models/Exams.js";
import {authenticate, authorize} from "../middleware/auth.js";
import QRCode from "qrcode";

const router = express.Router();

// ============ EXAM MANAGEMENT ROUTES ============
// (To be implemented: create exam, update exam, delete exam, get exams, etc.)

// Get all exams for authenticated admin's organization, enable search, filter by active, status, and pagination - admin only
router.get('/', authenticate, authorize("admin", "examiner", "candidate"), async (req, res) => {
    try {
        const { search = "", active, status, limit = "10", page = "1" } = req.query;
        const safeLimit = Math.min(parseInt(limit), 100);
        const safePage = Math.max(parseInt(page), 1);
        const skip = (safePage - 1) * safeLimit;

        let query = { organizationId: req.user.organizationId };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { examCode: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        if (active !== undefined) {
            query.active = active === "true";
        }

        if (status) {
            query.status = status;
        }

        const exams = await Exam.find(query).limit(safeLimit).skip(skip);
        const totalExams = await Exam.countDocuments(query);
        const totalPages = Math.ceil(totalExams / safeLimit);

        res.status(200).json({
            success: true,
            data: exams,
            pagination: {
                limit: safeLimit,
                page: safePage,
                totalPages,
                hasNextPage: safePage < totalPages,
                hasPrevPage: safePage > 1
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get All Exams for authenticated user and user's organization, enable search, filter by active, status, and pagination - examiner only
// router.get('/examiner-exams', authenticate, authorize("examiner"), async (req, res) => {
//     try {
//         const { search = "", active, status, limit = "10", page = "1" } = req.query;
//         const safeLimit = Math.min(parseInt(limit), 100);
//         const safePage = Math.max(parseInt(page), 1);
//         const skip = (safePage - 1) * safeLimit;

//         let query = { createdBy: req.user.userId, organizationId: req.user.organizationId };
//         // console.log('User Organization ID', req.user.organizationId)

//         if (search) {
//             query.$or = [
//                 { title: { $regex: search, $options: "i" } },
//                 { examCode: { $regex: search, $options: "i" } },
//                 { description: { $regex: search, $options: "i" } }
//             ];
//         }

//         if (active !== undefined) {
//             // Schema defines the field as `isActive` — query that field instead of `active`.
//             query.isActive = active === "true";
//         }

//         if (status) {
//             query.status = status;
//         }

//         const exams = await Exam.find(query).limit(safeLimit).skip(skip);
//         const totalExams = await Exam.countDocuments(query);
//         const totalPages = Math.ceil(totalExams / safeLimit);

//         res.status(200).json({
//             success: true,
//             data: exams,
//             pagination: {
//                 limit: safeLimit,
//                 page: safePage,
//                 totalPages,
//                 hasNextPage: safePage < totalPages,
//                 hasPrevPage: safePage > 1
//             }
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// Create Exam - admin only, exam must be associated with authenticated user's organization

router.post("/create", authenticate, authorize("admin"), async (req, res) => {
    // Create a new exam
    try{
        const { title, description, duration, totalMark, passingMark, instructions, scheduleStart, scheduleEnd, numberOfQuestions } = req.body;

        // Validation
        if (!title || !duration || !totalMark || !passingMark || !instructions || !scheduleStart || !scheduleEnd) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // ensure scheduler start is before end
        if (new Date(scheduleStart) >= new Date(scheduleEnd)) {
            return res.status(400).json({ success: false, message: "Schedule start must be before schedule end" });
        }

        // ensure duration is positive
        if (duration <= 0) {
            return res.status(400).json({ success: false, message: "Duration must be greater than 0" });
        }

        // ensure marks are positive
        if (totalMark <= 0 || passingMark < 0 || passingMark > totalMark) {
            return res.status(400).json({ success: false, message: "Invalid marks configuration" });
        }

        const exam = new Exam({ 
            title, 
            description, 
            duration, 
            numberOfQuestions: numberOfQuestions || 0,
            totalMark, 
            passingMark, 
            instructions, 
            scheduleStart, 
            scheduleEnd, 
            createdBy: req.user.userId, 
            organizationId: req.user.organizationId 
        });

        // Generate QR Code
        exam.qrCode = await QRCode.toDataURL(exam._id.toString());
        
        await exam.save();
        res.status(201).json({ success: true, data: exam });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Exam by ID - only if belongs to authenticated user's organization
router.get('/:id', authenticate, authorize("admin", "examiner", "candidate"), async (req, res) => { 
    try{
        const { id } = req.params;
        const exam = await Exam.findOne({ _id: id, organizationId: req.user.organizationId });
        
        if (!exam) {
            return res.status(404).json({ success: false, message: "Exam not found" });
        }

        res.status(200).json({ success: true, data: exam });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
 });

// Update Exam - only if belongs to authenticated user's organization
router.put('/:id', authenticate, authorize("admin"), async (req, res) => { 
    try{
            const { id } = req.params;
            const updateData = req.body;

            // If scheduleStart or scheduleEnd is being updated, ensure they are valid
            if (updateData.scheduleStart && updateData.scheduleEnd) {
                if (new Date(updateData.scheduleStart) >= new Date(updateData.scheduleEnd)) {
                    return res.status(400).json({ success: false, message: "Schedule start must be before schedule end" });
                }
            }

            const exam = await Exam.findOneAndUpdate(
                { _id: id, organizationId: req.user.organizationId },
                updateData,
                { new: true }
            );

            if (!exam) {
                return res.status(404).json({ success: false, message: "Exam not found" });
            }

            res.status(200).json({ success: true, data: exam, message: "Exam updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
     }
 });

// Delete Exam - only if belongs to authenticated user's organization
router.delete('/:id', authenticate, authorize("admin"), async (req, res) => { 
    try{
        const { id } = req.params;
        const exam = await Exam.findOneAndDelete({ _id: id, organizationId: req.user.organizationId });
        
        if (!exam) {
            return res.status(404).json({ success: false, message: "Exam not found" });
        }

        res.status(200).json({ success: true, data: exam, message: `${exam.examCode} deleted successfully` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
 });

/**
 * @swagger
 * tags:
 *   - name: Exams
 *     description: Exam management endpoints
 *
 * /api/exam/admin-exams:
 *   get:
 *     tags:
 *       - Exams
 *     summary: Get exams for the authenticated admin's organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of exams returned
 *
 * /api/exam/examiner-exams:
 *   get:
 *     tags:
 *       - Exams
 *     summary: Get exams created by the authenticated examiner
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of examiner exams returned
 *
 * /api/exam/create:
 *   post:
 *     tags:
 *       - Exams
 *     summary: Create a new exam
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - duration
 *               - totalMark
 *               - passingMark
 *               - scheduleStart
 *               - scheduleEnd
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: integer
 *               totalMark:
 *                 type: number
 *               passingMark:
 *                 type: number
 *               instructions:
 *                 type: string
 *               scheduleStart:
 *                 type: string
 *                 format: date-time
 *               scheduleEnd:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Exam created successfully
 *
 * /api/exam/{id}:
 *   get:
 *     tags:
 *       - Exams
 *     summary: Get exam by ID for organization members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam data returned
 *       404:
 *         description: Exam not found
 *   put:
 *     tags:
 *       - Exams
 *     summary: Update an existing exam
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: integer
 *               totalMark:
 *                 type: number
 *               passingMark:
 *                 type: number
 *               instructions:
 *                 type: string
 *               scheduleStart:
 *                 type: string
 *                 format: date-time
 *               scheduleEnd:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Exam updated successfully
 *   delete:
 *     tags:
 *       - Exams
 *     summary: Delete an exam by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam deleted successfully
 */
export default router;