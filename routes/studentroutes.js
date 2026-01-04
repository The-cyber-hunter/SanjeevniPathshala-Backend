const express = require("express");
const router = express.Router();
const Student = require("../models/student");

/**
 * ✅ CHECK STUDENT STATUS USING ALL DETAILS
 * POST /api/student/status
 */
router.post("/status", async (req, res) => {
  const { name, email, phone, class: studentClass } = req.body;

  if (!name || !email || !phone || !studentClass) {
    return res.status(400).json({
      registered: false,
      message: "All fields are required",
    });
  }

  try {
    const student = await Student.findOne({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      class: studentClass.trim(),
    });

    if (!student) {
      return res.json({ registered: false });
    }

    res.json({ registered: true, student });
  } catch (err) {
    console.error("❌ Student status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
