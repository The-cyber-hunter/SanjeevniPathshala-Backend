const express = require("express");
const router = express.Router();
const { sendContactMessage } = require("../controllers/contactcontroller");

// POST /api/contact
router.post("/", sendContactMessage);

module.exports = router;
