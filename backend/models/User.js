import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String},
    password: { type: String, required: true },
    ranNo: { type: String, unique: true, required: true },
    role: {
      type: String,
      required: true,
      enum: ["super", "admin", "candidate", "examiner"],
      default: "candidate",
    },
    phone: { type: String},
    address: { type: String },
    association: { type: String },
    conference: { type: String },
    avatar: {
      type: String,
      default: "https://randomuser.me/api/portraits/lego/1.jpg",
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // examTaken: {
    //     type: Boolean,
    //     default: false
    // },
    // examAttempts: {
    //     type: Number,
    //     default: 0
    // },
    isActive: { type: Boolean, default: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// When converting to JSON, hide the password
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model("User", userSchema);

export default User;
