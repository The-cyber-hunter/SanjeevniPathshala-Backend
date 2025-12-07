const Admin = require("../models/admin");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendemail");

// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
  try {
    const { password } = req.body;

    const admin = await Admin.findOne();
    if (!admin) return res.status(500).json({ message: "Admin not found" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(400).json({ message: "Incorrect password" });

    return res.json({ message: "Login successful" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------- SEND OTP ----------------
exports.sendOTP = async (req, res) => {
  try {
    const admin = await Admin.findOne();
    if (!admin) return res.status(500).json({ message: "Admin not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    admin.otp = otp;
    admin.otpExpires = Date.now() + 10 * 60 * 1000;
    await admin.save();

    await sendEmail(
      admin.email,
      "Password Reset OTP",
      `<p>Your OTP is: <b>${otp}</b></p>`
    );

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// ---------------- VERIFY OTP ----------------
exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    console.log("Received OTP:", otp);

    const admin = await Admin.findOne();
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    console.log("Stored OTP:", admin.otp);
    console.log("Expiry:", admin.otpExpires, "Now:", Date.now());

    if (!otp)
      return res.status(400).json({ message: "Please enter OTP" });

    if (admin.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (admin.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    res.json({ message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// ---------------- RESET PASSWORD ----------------
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    const admin = await Admin.findOne();
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.password = await bcrypt.hash(password, 10);
    admin.otp = null;
    admin.otpExpires = null;

    await admin.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
