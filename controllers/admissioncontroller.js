const Student = require("../models/student.js");

// Controller to register a student
exports.registerStudent = async (req, res) => {
  const { name, email, phone, class: studentClass } = req.body;

  try {
    // ✅ Check if student is already registered with same details
    const existing = await Student.findOne({
      name,
      email,
      phone,
      class: studentClass,
    });

    if (existing) {
      return res.status(409).json({
        message: "You are already registered with these details.",
      });
    }

    // Create new student entry
    const student = new Student({
      name,
      email,
      phone,
      class: studentClass,
    });

    await student.save();

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
