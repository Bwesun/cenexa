import mongoose from "mongoose";
import Exam from "./Exams.js";
import Organization from "./Organization.js";
import Question from "./Questions.js";
import User from "./User.js";

const candidateExamSchema = new mongoose.Schema(
    {
        candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
        organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
        questionAnswers: [
            {
                question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
                // Store the selected option index and text for easier grading and review
                selectedOptionIndex: { type: Number, default: null },
                selectedOptionText: { type: String, default: "" },
            }
        ],
        timeStarted: { type: Date, default: Date.now },
        timeEnded: { type: Date },
        submittedAt: { type: Date },
        isSubmitted: { type: Boolean, default: false },
        score: { type: Number },
        totalAttempted: { type: Number },
        totalCorrect: { type: Number },
        totalIncorrect: { type: Number },
        percentage: {type: Number},
        totalBlank: { type: Number },
        passed: { type: Boolean },
    },
    { timestamps: true },
);

const CandidateExam = mongoose.model("CandidateExam", candidateExamSchema);
export default CandidateExam;