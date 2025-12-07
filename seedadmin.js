require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/admin"); 

// Connect to Mongo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Seed Admin
const seedAdmin = async () => {
  try {
    const existing = await Admin.findOne({ email: "admin@sanjeevni.com" });
    if (existing) {
      console.log("Admin already exists:", existing.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await Admin.create({
      email: "admin@sanjeevni.com",
      password: hashedPassword,
    });

    console.log("Admin created successfully!");
    console.log("Email:", admin.email);
    console.log("Password: admin123");
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
};

seedAdmin();
