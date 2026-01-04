const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    class: { type: String, required: true },
    message: { type: String },

    registrationPaid: { type: Boolean, default: false },

    monthlyPayments: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// ✅ Compound unique index (ALL details together)
studentSchema.index(
  { name: 1, email: 1, phone: 1, class: 1 },
  { unique: true }
);

module.exports = mongoose.model("Student", studentSchema);
