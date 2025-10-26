const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otpCode: { type: String, required: true },
  otpExpires: { type: Date, required: true },
  isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model("OtpVerification", otpVerificationSchema, "otpVerifications");