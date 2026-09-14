import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Exam from "../models/Exams.js";
import {authenticate, authorize} from "../middleware/auth.js";
import Question from "../models/Questions.js";
import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import upload from "../middleware/upload.js";
import { uploadQuestions } from "../controllers/question.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ============ QUESTION MANAGEMENT ROUTES ============
// Get All Questions paginated with search term, limit and page query parameters
router.get('/admin-questions/:examId', authenticate, authorize("admin"), async (req, res) => {
    try{
        const {
  search = "",
  limit = 10,
  page = 1,
} = req.query;
const examId = req.params.examId;

const safeSearch = typeof search === "string" ? search.trim() : "";
const safeLimit = Math.max(parseInt(limit, 10) || 10, 1);
const safePage = Math.max(parseInt(page, 10) || 1, 1);

const skip = (safePage - 1) * safeLimit;

// COnfirm if exam exists
// convert userId to an object
const exam = await Exam.findById({ _id: examId, organizationId: req.user.organizationId }).populate('title');
if (!exam) {
    return res.status(404).json({ success: false, message: "Exam not found!" });
}

// Build query
const query = safeSearch
  ? {
      $or: [
        { text: { $regex: safeSearch, $options: "i" } },
        { questionCode: { $regex: safeSearch, $options: "i" } },
      ],
    }
  : {};
  // console.log("OrganizationId:", req.user.organizationId);

// Run queries in parallel (performance boost) where organizationId is from authenticated user
// Get arrange from newest to oldest
const [questions, totalDocs] = await Promise.all([
  Question.find({ ...query, organizationId: req.user.organizationId, exam: examId }).populate('exam')
    .sort({ createdAt: -1 })  
    .limit(safeLimit)
    .skip(skip),

  Question.countDocuments({ ...query, organizationId: req.user.organizationId, exam: examId }),
]);

// Derived pagination values
const totalPages = Math.ceil(totalDocs / safeLimit);

const pagination = {
  totalDocs,
  limit: safeLimit,
  page: safePage,
  totalPages,
  hasNextPage: safePage < totalPages,
  hasPrevPage: safePage > 1,
};

// Response
return res.json({
  exam: exam.title,
  qrCode: exam.qrCode,
  data: questions,
  pagination,
});
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ success: false, message: "Error fetching questions" });
    }
});

// Get Questions for Examiner
router.get('/examiner-questions/:examId', authenticate, authorize("examiner"), async (req, res) => {
    try{
        const {
  search = "",
  limit = 10,
  page = 1,
} = req.query;
const examId = req.params.examId;

const safeSearch = typeof search === "string" ? search.trim() : "";
const safeLimit = Math.max(parseInt(limit, 10) || 10, 1);
const safePage = Math.max(parseInt(page, 10) || 1, 1);

const skip = (safePage - 1) * safeLimit;

// COnfirm if exam exists
// convert userId to an object
const exam = await Exam.findById({ _id: examId, organizationId: req.user.organizationId, createdBy: req.user.userId }).populate('title').populate('qrCode');
if (!exam) {
    return res.status(404).json({ success: false, message: "Exam not found!" });
}

// Build query
const query = safeSearch
  ? {
      $or: [
        { text: { $regex: safeSearch, $options: "i" } },
        { questionCode: { $regex: safeSearch, $options: "i" } },
      ],
    }
  : {};
  // console.log("OrganizationId:", req.user.organizationId);

// Run queries in parallel (performance boost) where organizationId is from authenticated user
// Get arrange from newest to oldest
const [questions, totalDocs] = await Promise.all([
  Question.find({ ...query, organizationId: req.user.organizationId, createdBy: req.user.userId, exam: examId }).populate('exam')
    .sort({ createdAt: -1 })  
    .limit(safeLimit)
    .skip(skip),

  Question.countDocuments({ ...query, organizationId: req.user.organizationId, createdBy: req.user.userId, exam: examId }),
]);

// Derived pagination values
const totalPages = Math.ceil(totalDocs / safeLimit);

const pagination = {
  totalDocs,
  limit: safeLimit,
  page: safePage,
  totalPages,
  hasNextPage: safePage < totalPages,
  hasPrevPage: safePage > 1,
};

// Response
return res.json({
  exam: exam.title,
  qrCode: exam.qrCode,
  data: questions,
  pagination,
});
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ success: false, message: "Error fetching questions" });
    }
});

// Create Question
router.post('/add-question/:examId', authenticate, authorize("examiner"), async (req, res) => {
    try{
        const exam = req.params.examId;
        const { text, options } = req.body;
        const createdBy = req.user.userId;
        // console.log("Creating question with data:", { text, options, exam, createdBy });

        // Validate exam existence
        const examExists = await Exam.findById(exam);
        if (!examExists) {
            return res.status(400).json({ success: false, message: "Exam not found" });
        }

        const question = new Question({ text, options, exam, createdBy, organizationId: req.user.organizationId });
        await question.save();

        res.status(201).json({ success: true, data: question, message: "Question created successfully" });
    } catch (error) {
        // console.log("Error creating question:", error);
        res.status(500).json({ success: false, message: "Error creating question" });
    }
});

// Get Questions of specific Exam and paginate with limit and page query parameters
router.get('/exam/:examId', authenticate, authorize("admin", "examiner", "candidate"), async (req, res) => {
    try{
        const { examId } = req.params;
        const { limit = 10, page = 1 } = req.query;
        const skip = (page - 1) * limit;

        // check if exam exists
        const examExists = await Exam.findById(examId); 
        if (!examExists) {
            return res.status(404).json({ success: false, message: "Exam not found" });
        }
        
        const questions = await Question.find({ exam: examId, organizationId: req.user.organizationId }).limit(limit).skip(skip);

        res.status(200).json({ success: true, data: questions, pagination: { page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching questions" });
    }
});

// Download Template
router.get("/download-template", (req, res) => {
  try {
    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      "questions_template.csv"
    );

    res.download(filePath, "questions_template.csv", (err) => {
      if (err) {
        console.error("Error sending template:", err);
        res.status(500).json({ success: false, message: "Failed to download template" });
      }
    });
  } catch (error) {
    console.error("Error downloading template:", error);
    res.status(500).json({ success: false, message: "Failed to download template" });
  }
});

// Get Question by ID
router.get('/:id', authenticate, authorize("admin", "examiner"), async (req, res) => {
    try{
        const { id } = req.params;
        const question = await Question.findOne({_id: id, organizationId: req.user.organizationId});

        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        res.status(200).json({ success: true, data: question });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching question" });
    }
});

// Update Question 
router.put('/:id', authenticate, authorize("examiner"), async (req, res) => {
    try{
        const { id } = req.params;
        const updateData = req.body;

        const question = await Question.findByIdAndUpdate(
            { _id: id, organizationId: req.user.organizationId, createdBy: req.user.userId },
            updateData,
            { returnDocument: true }
        );

        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        res.status(200).json({ success: true, data: question, message: "Question updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating question" });
    }
});

// Delete Question
router.delete('/:id', authenticate, authorize("admin"), async (req, res) => {
    try{
        const { id } = req.params;
        const question = await Question.findByIdAndDelete({ _id: id, organizationId: req.user.organizationId });

        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        res.status(200).json({ success: true, data: question, message: "Question deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting question" });
    }
});

// Bulk Upload Questions from CSV file
router.post("/upload/:examId", authenticate, authorize("admin"), upload.single("file"), uploadQuestions
);



// Helper function to format question for exam
const formatQuestionForExam = (question) => {
  const examQuestion = {
    id: question._id,
    text: question.text,
    options: question.options,
  };
  return examQuestion;
};

/**
 * @swagger
 * tags:
 *   - name: Questions
 *     description: Question management endpoints
 *
 * /api/question/admin-questions:
 *   get:
 *     tags:
 *       - Questions
 *     summary: Get all questions for the authenticated admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
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
 *         description: Questions list returned
 *
 * /api/question/examiner-questions:
 *   get:
 *     tags:
 *       - Questions
 *     summary: Get questions created by the authenticated examiner
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
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
 *         description: Questions list returned
 *
 * /api/question/create:
 *   post:
 *     tags:
 *       - Questions
 *     summary: Create a new question for an exam
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - options
 *               - exam
 *             properties:
 *               text:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     isCorrect:
 *                       type: boolean
 *               exam:
 *                 type: string
 *     responses:
 *       201:
 *         description: Question created successfully
 *
 * /api/question/exam/{examId}:
 *   get:
 *     tags:
 *       - Questions
 *     summary: Get questions for a specific exam
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
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
 *         description: Exam questions returned
 *
 * /api/question/{id}:
 *   get:
 *     tags:
 *       - Questions
 *     summary: Get a question by ID
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
 *         description: Question returned
 *   put:
 *     tags:
 *       - Questions
 *     summary: Update a question
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
 *               text:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     isCorrect:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Question updated successfully
 *   delete:
 *     tags:
 *       - Questions
 *     summary: Delete a question by ID
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
 *         description: Question deleted successfully
 */

export default router;