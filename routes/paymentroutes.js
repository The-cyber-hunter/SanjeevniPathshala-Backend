const express = require("express");
const router = express.Router();
const { createOrder } = require("../controllers/paymentcontroller");

// Create order (normal JSON)
router.post("/create-order", createOrder);

module.exports = router;
