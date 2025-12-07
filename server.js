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

app.use(
  cors({
    origin: ["http://localhost:3000", "http://10.67.85.144:3000"],
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
(async () => {
  try {
    const admin = await Admin.findOne();
    if (!admin) {
      await Admin.create({
        email: "admin@sanjeevni.com",
        password: await bcrypt.hash("admin123", 10),
      });

      console.log("Default Admin Created → Email: admin@sanjeevni.com Password: admin123");
    }
  } catch (error) {
    console.log("Error seeding admin:", error.message);
  }
})();

// -----------------------
// ROUTES
// -----------------------
app.use("/api/admission", admissionRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/student", studentRoute);
app.use("/api/contact", contactRoute);
app.use("/api/admin", authRoute);   

// -----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
