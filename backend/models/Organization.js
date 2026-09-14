import mongoose from "mongoose";
import { getNextOrgSequenceValue } from "./OrganizationCounter.js";
import OrganizationCounter from "./OrganizationCounter.js";

const organizationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        organizationCode: { type: String, unique: true, index: true },
        organizationNumber: { type: Number, unique: true, index: true },
        status: {type: String, enum: ["active", "pending", "inactive"], default: "active"}
    },
    { timestamps: true }
);

// Auto-increment organizationNumber and generate organizationCode before validation
organizationSchema.pre("validate", async function () {
  if (!this.isNew) return;

  const nextNumber = await getNextOrgSequenceValue("organizationNumber");

  this.organizationNumber = nextNumber;
  this.organizationCode = `ORG${String(nextNumber)}`;

});

const Organization = mongoose.model("Organization", organizationSchema);
export default Organization;