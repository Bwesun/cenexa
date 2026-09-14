import mongoose from "mongoose";
import { getNextSequenceValue } from "./QuestionCounter.js";
import QuestionCounter from "./QuestionCounter.js";

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    questionNumber: {
      type: Number,
      unique: true,
      index: true,
    },

    questionCode: {
      type: String,
      unique: true,
      index: true,
    },
    options: {
      type: [
        {
          text: {
            type: String,
            required: true,
          },
          isCorrect: {
            type: Boolean,
            default: false,
          },
        },
      ],
      validate: {
        validator: function (options) {
          const correctOptions = options.filter((option) => option.isCorrect);

          return options.length >= 2 && correctOptions.length === 1;
        },
        message:
          "A question must have at least 2 options and exactly 1 correct answer.",
      },
    },
    // mark: {type: Number, required: true},
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true },
);

// Auto-increment questionNumber and generate questionCode before validation
questionSchema.pre("validate", async function () {
  if (!this.isNew) return;

  const nextNumber = await getNextSequenceValue("questionNumber");

  this.questionNumber = nextNumber;
  this.questionCode = `Q${String(nextNumber)}`;
});

const Question = mongoose.model("Question", questionSchema);
export default Question;
