const express = require("express");
const router = express.Router();
const { registerStudent } = require("../controllers/admissioncontroller");

// POST /api/admission
router.post("/", registerStudent);

module.exports = router;
