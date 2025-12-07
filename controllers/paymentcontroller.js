require("dotenv").config();
const Razorpay = require("razorpay");
const Student = require("../models/student");
const crypto = require("crypto");
const sendEmail = require("../utils/sendemail");
const generateReceipt = require("../utils/generateReceipt"); // new PDF generator

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---------------------
// CREATE ORDER
// ---------------------
exports.createOrder = async (req, res) => {
  try {
    const { email, type, name, phone, class: studentClass } = req.body;

    if (!email || !type) return res.status(400).json({ message: "Missing required fields" });

    if (type === "monthly") {
      const st = await Student.findOne({ email });
      if (!st) return res.status(400).json({ message: "Student not registered" });
      if (!st.registrationPaid) return res.status(400).json({ message: "Complete registration first" });
    }

    const amount = 200 * 100; // ₹200 in paise

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      payment_capture: 1,
      notes: { email, type, name, phone, class: studentClass },
    });

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("❌ Create Order Error:", err);
    res.status(500).json({ message: "Error creating order" });
  }
};

// ---------------------
// HANDLE WEBHOOK
// ---------------------
exports.handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const rawBody = req.body.toString(); // important for signature
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.log("❌ Webhook Signature Mismatch");
      return res.status(400).json({ status: "invalid signature" });
    }

    console.log("✅ Webhook Verified");

    const payload = JSON.parse(rawBody);
    const payment = payload.payload.payment.entity;
    const notes = payment.notes;

    if (!notes) return res.status(200).json({ status: "no_notes" });

    const { email, type, name, phone, class: studentClass } = notes;
    const amount = payment.amount / 100; // convert paise to rupees

    // ----------------- REGISTRATION -----------------
    if (type === "registration") {
      let student = await Student.findOne({ email });
      if (!student) {
        student = await Student.create({
          name,
          email,
          phone,
          class: studentClass,
          registrationPaid: true,
        });
      } else {
        student.registrationPaid = true;
        await student.save();
      }

      // Generate PDF receipt
      const pdfBuffer = await generateReceipt(student, type, amount);

      // Send email with PDF
      await sendEmail(
        student.email,
        "✅ Registration Receipt",
        `<p>Hi ${name}, your registration is successful ,welcome to the sanjeevni pathshala family. Please find your receipt attached.</p>`,
        [{ filename: "Receipt.pdf", content: pdfBuffer }]
      );

      await sendEmail(
        process.env.ADMIN_EMAIL,
        "New Registration",
        `Student registered: ${name} (${email})`,
        [{ filename: "🧾Receipt.pdf", content: pdfBuffer }]
      );
    }

    // ----------------- MONTHLY PAYMENT -----------------
    if (type === "monthly") {
      const student = await Student.findOne({ email });
      if (!student) return res.status(200).json({ status: "student_not_found" });

      student.monthlyPayments.push({ amount, date: new Date() });
      await student.save();

      // Generate PDF receipt
      const pdfBuffer = await generateReceipt(student, type, amount);

      await sendEmail(
        student.email,
        "Monthly Payment Receipt",
        `<p>Hi ${student.name}, your monthly fee is received. Please find your receipt attached.</p>`,
        [{ filename: "Receipt.pdf", content: pdfBuffer }]
      );

      await sendEmail(
        process.env.ADMIN_EMAIL,
        "💰 Monthly Fee Received",
        `Monthly fee received from ${student.name}`,
        [{ filename: "🧾Receipt.pdf", content: pdfBuffer }]
      );
    }

    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    res.status(500).json({ status: "error" });
  }
};
