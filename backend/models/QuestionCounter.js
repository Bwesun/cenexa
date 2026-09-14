import mongoose from "mongoose";

const questionCounterSchema = new mongoose.Schema({
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
const getNextSequenceValue = async (counterName) => {
  const counter = await QuestionCounter.findByIdAndUpdate(
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

const QuestionCounter = mongoose.model("QuestionCounter", questionCounterSchema);

export { getNextSequenceValue };
export default QuestionCounter;