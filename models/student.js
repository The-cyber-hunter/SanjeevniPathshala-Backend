const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    class: { type: String, required: true },
    message: { type: String },
    registrationPaid: { type: Boolean, default: false }, 
    monthlyPayments: [
      {
        amount: { type: Number, default: 200 },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
