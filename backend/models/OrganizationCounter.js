import mongoose from "mongoose";

const OrganizationCounterSchema = new mongoose.Schema({
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
const getNextOrgSequenceValue = async (counterName) => {
  const counter = await OrganizationCounter.findByIdAndUpdate(
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

const OrganizationCounter = mongoose.model("OrganizationCounter", OrganizationCounterSchema);

export { getNextOrgSequenceValue };
export default OrganizationCounter;