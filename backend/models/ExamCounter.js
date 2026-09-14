import mongoose from "mongoose";

const ExamCounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  sequenceValue: {
    type: Number,
    default: 0,
  },
});

// Function to get the next sequence value for a given counter
const getNextExamSequenceValue = async (counterName) => {
  const counter = await ExamCounter.findByIdAndUpdate(
    counterName,
    {
      $inc: { sequenceValue: 1 },
    },
    {
      returnDocument: "after",
      upsert: true,
    }
  );

  return counter.sequenceValue;
};

const ExamCounter = mongoose.model("ExamCounter", ExamCounterSchema);

export { getNextExamSequenceValue };
export default ExamCounter;