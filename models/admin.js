const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    default: "admin@sanjeevni.com",
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("Admin", adminSchema);
