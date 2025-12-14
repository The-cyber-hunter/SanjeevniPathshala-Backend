const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db");
const admissionRoute = require("./routes/admissionroutes");
const paymentRoute = require("./routes/paymentroutes");
const studentRoute = require("./routes/studentroutes");
const contactRoute = require("./routes/contactroutes");
const authRoute = require("./routes/adminroutes");   

const cors = require("cors");
const Admin = require("./models/admin");
const bcrypt = require("bcryptjs");

dotenv.config();
connectDB();

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  require("./controllers/paymentcontroller").handleWebhook
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use("/api/admission", admissionRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/student", studentRoute);
app.use("/api/contact", contactRoute);
app.use("/api/admin", authRoute);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);


process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});
