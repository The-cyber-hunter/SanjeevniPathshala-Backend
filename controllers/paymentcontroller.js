require("dotenv").config();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Student = require("../models/student");
const sendEmail = require("../utils/sendemail");
const generateReceipt = require("../utils/generateReceipt");

// =========================
// Razorpay instance
// =========================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =========================
// CLASS-WISE MONTHLY FEE
// =========================
const getMonthlyFee = (studentClass) => {
  const classNumber = parseInt(studentClass.replace(/\D/g, ""));

  if (classNumber >= 1 && classNumber <= 4) return 150;
  if (classNumber >= 5 && classNumber <= 6) return 175;
  if (classNumber >= 7 && classNumber <= 8) return 200;
  if (classNumber >= 9 && classNumber <= 10) return 250;

  return 0;
};

// =========================
// CREATE ORDER
// =========================
exports.createOrder = async (req, res) => {
  try {
    const { name, email, phone, class: studentClass, type } = req.body;

    if (!name || !email || !phone || !studentClass || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let amount = 0;

    // ---------- REGISTRATION ----------
    if (type === "registration") {
      amount = 200;
    }

    // ---------- MONTHLY ----------
    if (type === "monthly") {
      const student = await Student.findOne({
        name,
        email,
        phone,
        class: studentClass,
      });

      if (!student) {
        return res.status(400).json({ message: "Student not registered" });
      }

      if (!student.registrationPaid) {
        return res.status(400).json({ message: "Complete registration first" });
      }

      amount = getMonthlyFee(studentClass);

      if (!amount) {
        return res.status(400).json({ message: "Invalid class selected" });
      }
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      payment_capture: 1,
      notes: {
        name,
        email,
        phone,
        class: studentClass,
        type,
      },
    });

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("❌ Create Order Error:", err);
    res.status(500).json({ message: "Error creating order" });
  }
};

// =========================
// HANDLE WEBHOOK
// =========================
exports.handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];
    console.log("🔹 Secret used:", secret);
    console.log("🔹 Received signature:", signature);
    console.log("🔹 Raw body length:", req.body.length);
    console.log("🔹 Raw body (first 200 chars):", req.body.toString().slice(0, 200));

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.log("❌ Webhook Signature Mismatch");
    console.log("Raw body:", req.body.toString());
    console.log("Computed signature:", expectedSignature);
    console.log("Received signature:", signature);
      return res.status(400).json({ status: "invalid_signature" });
    }

    console.log("✅ Webhook Verified");

    const payload = JSON.parse(req.body.toString());
    const payment = payload.payload.payment.entity;
    const notes = payment.notes;
    console.log("Payload:", payload);
    if (!notes) return res.status(200).json({ status: "no_notes" });

    const { name, email, phone, class: studentClass, type } = notes;
    const amount = payment.amount / 100;

    // ---------- REGISTRATION ----------
    if (type === "registration") {
  let student = await Student.findOne({
    name,
    email,
    phone,
    class: studentClass,
  });

  // 🔴 EXACT DUPLICATE → STOP HERE
  if (student) {
    return res.status(200).json({
      status: "already_registered",
      message: "Student already registered with same details",
    });
  }

  // 🟢 NOT FOUND → CREATE NEW ENTRY
   student = await Student.create({
    name,
    email,
    phone,
    class: studentClass,
    registrationPaid: true,
  });

      const studentPdf = await generateReceipt(student, type, amount, false);
      const adminPdf = await generateReceipt(student, type, amount, true);
      await sendEmail(
        student.email,
        "✅ Registration Receipt",
        `<p>Hi ${student.name}, your registration is successful,Welcome to the Sanjeevni Pathshala family!!.</p>`,
        [{ filename: "Receipt.pdf", content: studentPdf }]
      );

      await sendEmail(
        process.env.ADMIN_EMAIL,
        "🆕 New Registration",
        `Student registered: ${student.name} (${student.class})`,
        [{ filename: "Receipt.pdf", content: adminPdf}]
      );
    }

    // ---------- MONTHLY ----------
    if (type === "monthly") {
      const student = await Student.findOne({
        name,
        email,
        phone,
        class: studentClass,
      });

      if (!student)
        return res.status(400).json({ status: "student_not_found" });

      if (!student.registrationPaid)
        return res.status(400).json({ status: "registration_not_done" });

      // Prevent double payment in same month
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const alreadyPaid = student.monthlyPayments.some(
        (p) =>
          p.date.getMonth() === currentMonth &&
          p.date.getFullYear() === currentYear
      );

      if (alreadyPaid) {
        return res.status(400).json({
          status: "already_paid",
          message: "Monthly fee already paid for this month",
        });
      }

      const feeAmount = getMonthlyFee(studentClass);

      student.monthlyPayments.push({
        amount: feeAmount,
        date: new Date(),
      });

      await student.save();

      const studentPdf = await generateReceipt(student, type, feeAmount, false);
      const adminPdf = await generateReceipt(student, type, feeAmount, true);

      await sendEmail(
        student.email,
        "💰 Monthly Fee Receipt",
        `<p>Hi ${student.name}, your monthly fee of ₹${feeAmount} has been received.</p>`,
        [{ filename: "Receipt.pdf", content: studentPdf }]
      );

      await sendEmail(
        process.env.ADMIN_EMAIL,
        "💰 Monthly Fee Received",
        `Monthly fee received from ${student.name} (₹${feeAmount})`,
        [{ filename: "Receipt.pdf", content: adminPdf}]
      );
    }

    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    res.status(500).json({ status: "error" });
  }
};
