import mongoose from "mongoose";
import { getNextExamSequenceValue } from "./ExamCounter.js";
import ExamCounter from "./ExamCounter.js";
import Organization from "./Organization.js";

const examSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        examCode: { type: String, unique: true, required: true },
        examNumber: { type: Number, unique: true, required: true },
        duration: { type: Number, required: true }, // Duration in minutes
        numberOfQuestions: { type: Number, required: true },
        instructions: { type: String },
        totalMark: { type: Number, required: true },
        passingMark: { type: Number, required: true },
        scheduleStart: { type: Date, required: true },
        scheduleEnd: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        qrCode: { type: String, required: true},
        location: {
            latitude: { type: Number, default: null},
            longitude: { type: Number, default: null},
            radius: {
                type: Number,
                default: 50 // meters
            }
        },

        // status to be published, unpublished, archived
        status: {
            type: String,
            enum: ["published", "unpublished", "archived"],
            default: "unpublished",
        },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    },
    { timestamps: true },
);

// Auto-increment examNumber and generate examCode before validation
examSchema.pre("validate", async function () {
  if (!this.isNew) return;

  const nextNumber = await getNextExamSequenceValue("examNumber");

  this.examNumber = nextNumber;
  this.examCode = `EXAM${String(nextNumber)}`;
});

const Exam = mongoose.model("Exam", examSchema);
export default Exam;