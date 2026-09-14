import mongoose from "mongoose";
import User from "./User.js";
import Exam from "./Exams.js";
import Organization from "./Organization.js";

const resultSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    candidateExam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CandidateExam",
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    totalScore: { type: Number, required: true },
    percentage: { type: Number, required: true },
    totalAttempted: { type: Number, required: true },
    totalCorrect: { type: Number, required: true },
    totalIncorrect: { type: Number, required: true },
    totalBlank: { type: Number, required: true },
    passed: { type: Boolean, required: true },
  },
  { timestamps: true },
);

const Result = mongoose.model("Result", resultSchema);
export default Result;
