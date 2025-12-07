// routes/student.js
const express = require("express");
const router = express.Router();
const Student = require("../models/student");

// GET student status by email
router.get("/status/:email", async (req, res) => {
  const { email } = req.params;
  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    const student = await Student.findOne({ email });
    if (!student) return res.json({ registered: false });

    res.json({ registered: true, student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
