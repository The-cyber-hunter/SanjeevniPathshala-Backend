const express = require("express");
const router = express.Router();

// Import existing auth controller
const {
  login,
  sendOTP,
  verifyOTP,
  resetPassword,
} = require("../controllers/adminauthcontroller");

// Import the new single admin controller
const adminController = require("../controllers/admincontroller");

// ---------------- AUTH ROUTES ----------------
router.post("/login", login);
router.post("/forgot-password", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// ---------------- ADMIN DASHBOARD & STUDENTS & PAYMENTS ----------------
router.get("/dashboard", adminController.getDashboard);
router.get("/students", adminController.getStudents);
router.get("/payments", adminController.getPayments);
router.post("/payments/toggle", adminController.togglePayment);

module.exports = router;
