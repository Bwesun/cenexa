// Candidate exam routes handle starting an exam attempt, saving answers,
// and submitting the completed attempt for a candidate user.
import express from "express";
import Exam from "../models/Exams.js";
import CandidateExam from "../models/CandidateExam.js";
import { authenticate, authorize } from "../middleware/auth.js";
import Question from "../models/Questions.js";
import Result from "../models/Results.js";

const router = express.Router();


// Fisher-Yates shuffle to randomize question order when there are more than the allowed limit.
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Get Question and its options
router.get("/get-question/:questionId", authenticate, authorize("candidate"), async (req, res) => { 
    console.log("Output!")
    try{
        const {questionId} = req.params;
        // console.log("QuestionId: ", questionId)

    const question = await Question.findOne({
        _id: questionId,
        organizationId: req.user.organizationId
    });

    if(!question){
        return res.status(404).json({ success: false, message: "Question unavailable" });
    }

    res.json({
        success: true,
        data: {
            question: question.text,
            options: question.options
        }
    })
    } catch (error){
        res.status(500).json({ success: false, error: error.message });
    }
 });

// Get candidate exam details, and questions array
router.get("/candidate-exam/:candidateExamId", authenticate, authorize("candidate"), async (req, res) => {
    try{
        const {candidateExamId} = req.params;
        
        const candidateExam = await CandidateExam.findOne({
            _id: candidateExamId,
            organizationId: req.user.organizationId
        }).populate('questionAnswers.question').populate('exam');

        if (!candidateExam){
            return res.status(404).json({ success: false, message: "Exam not found. Start a new exam" });
        }

        const examDetails = await Exam.findOne({
            _id: candidateExam.exam,
            organizationId: req.user.organizationId
        })

        res.json({
            success: true, 
            data: {
                examDetails: examDetails,
                questionArray: candidateExam.questionAnswers, 
                isSubmitted: candidateExam.isSubmitted
            },
        })
    } catch (error){
        res.status(500).json({ success: false, error: error.message });
    }
})

// Initiate and Setup Exam Environment
router.post('/initiate/:examId', authenticate, authorize("candidate"), async (req, res) => {
  try {
    const { examId } = req.params;
    const candidateId = req.user.userId;
    const organizationId = req.user.organizationId;

    // The authenticated candidate must not already have a started exam record for this exam.
    const existingCandidateExam = await CandidateExam.findOne({
      candidate: candidateId,
      exam: examId,
      organizationId,
    });

    if (existingCandidateExam) {
        // console.log("Details:", existingCandidateExam._id)
      return res.status(200).json({
        success: true,
        message: "Candidate exam already initiated. Continue to take exam.",
        data: {
          candidateExamId: existingCandidateExam._id,
          isSubmitted: existingCandidateExam.isSubmitted
        }
      });
    }

    // Load the exam and confirm it belongs to the candidate's organization.
    const exam = await Exam.findOne({ _id: examId, organizationId });
    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found." });
    }

    const questionMatch = { exam: examId, organizationId };
    const MAX_QUESTIONS = exam.numberOfQuestions;
    const totalQuestions = await Question.countDocuments(questionMatch);
    if (totalQuestions === 0) {
      return res.status(404).json({ success: false, message: "No questions found for this exam." });
    }

    // If the exam has many questions, randomize and keep only the maximum allowed.

    let questions = await Question.find(questionMatch).lean();
    if (questions.length > MAX_QUESTIONS) {
      questions = shuffleArray(questions).slice(0, MAX_QUESTIONS);
    }

    // Build the question answer placeholder array for the candidate exam.
    const questionsAnswers = questions.map((question) => ({
      question: question._id,
      selectedOptionIndex: null,
      selectedOptionText: "",
    }));

    // Create the candidate exam record with blank answers ready for the candidate.
    const candidateExam = new CandidateExam({
      candidate: candidateId,
      exam: examId,
      organizationId,
      questionAnswers: questionsAnswers,
    });

    await candidateExam.save();

    return res.status(201).json({
      success: true,
      message: "Candidate exam initiated successfully.",
      data: { candidateExamId: candidateExam._id },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save Answer
router.patch('/save/:candidateExamId', authenticate, authorize("candidate"), async (req, res) => {
  try {
    const { candidateExamId } = req.params;
    const { questionId, selectedOptionIndex, selectedOptionText } = req.body;
    const candidateId = req.user.userId;
    const organizationId = req.user.organizationId;

    // Validate that the request includes the needed answer details.
    if (!questionId || selectedOptionIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "questionId and selectedOptionIndex are required.",
      });
    }

    const candidateExam = await CandidateExam.findOne({
      _id: candidateExamId,
      candidate: candidateId,
      organizationId,
    });

    if (!candidateExam) {
      return res.status(404).json({ success: false, message: "Candidate exam not found." });
    }

    if (candidateExam.isSubmitted) {
      return res.status(400).json({ success: false, message: "Cannot save answer after exam submission." });
    }

    // Confirm the question exists and the selected index is in range.
    const question = await Question.findById(questionId).lean();
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }

    if (
      Number.isNaN(Number(selectedOptionIndex)) ||
      selectedOptionIndex < 0 ||
      selectedOptionIndex >= question.options.length
    ) {
      return res.status(400).json({ success: false, message: "Invalid selectedOptionIndex." });
    }

    // Update the saved candidate answer for this question in the candidate exam record.
    const answerItem = candidateExam.questionAnswers.find((item) => item.question.toString() === questionId);
    if (!answerItem) {
      return res.status(404).json({ success: false, message: "Question is not part of this candidate exam." });
    }

    answerItem.selectedOptionIndex = selectedOptionIndex;
    answerItem.selectedOptionText = selectedOptionText || question.options[selectedOptionIndex].text || "";

    await candidateExam.save();

    return res.status(200).json({ 
      success: true, 
      message: "Answer saved successfully.", 
      // data: candidateExam.questionAnswers 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit and Calculate exam. Generates result.
router.patch('/submit/:candidateExamId', authenticate, authorize("candidate"), async (req, res) => {
    try {
      const { candidateExamId } = req.params;
      const candidateId = req.user.userId;
      const organizationId = req.user.organizationId;

      // Get the candidate exam
      const candidateExam = await CandidateExam.findOne({
        _id: candidateExamId,
        candidate: candidateId,
        organizationId,
      });

      if (!candidateExam) {
        return res
          .status(404)
          .json({ success: false, message: "Candidate exam not found." });
      }

      // Check if the exam has already been submitted
      if (candidateExam.isSubmitted) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Exam has already been submitted.",
          });
      }

      // Get the exam details
      const exam = await Exam.findById(candidateExam.exam);
      if (!exam) {
        return res
          .status(404)
          .json({ success: false, message: "Exam not found." });
      }

      // Calculate scores
      const calculateScore = async (candidateExam) => {
        const questionAnswers = candidateExam.questionAnswers || [];

        if (questionAnswers.length === 0) {
          return {
            score: 0,
            totalAttempted: 0,
            totalCorrect: 0,
            totalWrong: 0,
            totalBlank: 0,
            totalQuestions: 0,
          };
        }

        // Extract all question IDs
        const questionIds = questionAnswers.map((answer) => answer.question);

        // Fetch all questions in one query
        const questions = await Question.find({
          _id: { $in: questionIds },
        }).select("options");

        // Create lookup map
        const questionMap = new Map(
          questions.map((question) => [question._id.toString(), question]),
        );

        let score = 0;
        let totalAttempted = 0;
        let totalCorrect = 0;
        let totalWrong = 0;
        let totalBlank = 0;

        for (const answer of questionAnswers) {
          const question = questionMap.get(answer.question.toString());

          // Skip if question no longer exists
          if (!question) {
            continue;
          }

          const correctOptionIndex = question.options.findIndex(
            (option) => option.isCorrect,
          );

          // No answer selected
          if (
            answer.selectedOptionIndex === null ||
            answer.selectedOptionIndex === undefined
          ) {
            totalBlank++;
            continue;
          }

          totalAttempted++;

          if (answer.selectedOptionIndex === correctOptionIndex) {
            score++;
            totalCorrect++;
          } else {
            totalWrong++;
          }
        }

        return {
          score,
          totalQuestions: questionAnswers.length,
          totalAttempted,
          totalCorrect,
          totalWrong,
          totalBlank,
        };
      };

      // calculate score using the function
      const score = await calculateScore(candidateExam);
      const percentage =
        exam.numberOfQuestions > 0
            ? Number(
                  ((score.score / exam.numberOfQuestions) * 100)
              ).toFixed(2)
            : 0;
      const passed = percentage >= Number(exam.passingMark);

      // Update the candidate exam with the score and submit it
      candidateExam.score = score.score;
      candidateExam.totalAttempted = score.totalAttempted;
      candidateExam.totalCorrect = score.totalCorrect;
      candidateExam.totalIncorrect = score.totalWrong;
      candidateExam.totalBlank = score.totalBlank;
      candidateExam.totalQuestions = score.totalQuestions;
      candidateExam.percentage = percentage;
      candidateExam.passed = passed;
      candidateExam.isSubmitted = true;
      candidateExam.timeEnded = Date.now();
      candidateExam.submittedAt = Date.now();

      // create result
      const result = await Result.create({
        candidate: candidateId,
        exam: candidateExam.exam,
        candidateExam: candidateExam._id,
        organizationId,
        totalScore: score.score,
        totalAttempted: score.totalAttempted,
        totalCorrect: score.totalCorrect,
        totalIncorrect: score.totalWrong,
        totalBlank: score.totalBlank,
        percentage: percentage,
        passed: passed,
      });

      // Generate the result
      const resultOutput = {
        candidate: candidateId,
        candidateExam: candidateExam._id,
        result: result._id,
        totalScore: score.score,
        totalCorrect: score.totalCorrect,
        totalIncorrect: score.totalWrong,
        totalBlank: score.totalBlank,
        totalQuestions: score.totalQuestions,
        percentage: percentage,
        passed: passed,
      };

      await candidateExam.save();
      await result.save();

      res.status(200).json({
        success: true,
        message: "Exam submitted successfully.",
        data: resultOutput,
      });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
})


// Reset (delete) candidateExam for exam retake
router.delete('/reset/:candidateExamId', authenticate, authorize("candidate"), async (req, res) => {
  try {
    const { candidateExamId } = req.params;
    const candidateId = req.user.userId;
    const organizationId = req.user.organizationId;

    // Locate the candidate exam record before marking it submitted.
    const candidateExam = await CandidateExam.findOne({
      _id: candidateExamId,
      candidate: candidateId,
      organizationId: organizationId,
    });

    if (!candidateExam) {
      return res.status(404).json({ success: false, message: "Candidate exam not found. Start a new exam to continue." });
    }

    if (candidateExam.isSubmitted) {
      return res.status(400).json({ success: false, message: "Exam has already been submitted. You can only reset an exam that is not submitted." });
    }

    // Delete the exam to allow for a retake.
    await CandidateExam.deleteOne({ _id: candidateExamId });

    return res.status(200).json({ success: true, message: "Exam reset successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * tags:
 *   - name: CandidateExam
 *     description: Candidate exam and question access endpoints
 *
 * /api/candidate/get-question/{questionId}:
 *   get:
 *     tags:
 *       - CandidateExam
 *     summary: Get a question and options for a candidate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question returned successfully
 *
 * /api/candidate/candidate-exam/{candidateExamId}:
 *   get:
 *     tags:
 *       - CandidateExam
 *     summary: Get candidate exam details and answers array
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateExamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidate exam returned successfully
 *
 * /api/candidate/initiate/{examId}:
 *   post:
 *     tags:
 *       - CandidateExam
 *     summary: Initiate a candidate exam attempt
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Candidate exam initiation created successfully
 *
 * /api/candidate/submit/{candidateExamId}:
 *   post:
 *     tags:
 *       - CandidateExam
 *     summary: Submit a candidate exam and calculate results
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateExamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam submitted and graded successfully
 *
 * /api/candidate/save/{candidateExamId}:
 *   patch:
 *     tags:
 *       - CandidateExam
 *     summary: Save or update a candidate's selected answer during an exam
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateExamId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *               - selectedOptionIndex
 *             properties:
 *               questionId:
 *                 type: string
 *               selectedOptionIndex:
 *                 type: integer
 *               selectedOptionText:
 *                 type: string
 *     responses:
 *       200:
 *         description: Answer saved successfully
 *
 * /api/candidate/reset/{candidateExamId}:
 *   delete:
 *     tags:
 *       - CandidateExam
 *     summary: Reset a candidate exam record for retake
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateExamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidate exam reset successfully
 */
export default router;