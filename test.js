require("dotenv").config(); // load env variables
const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.EMAIL_PASS, // your Gmail App Password
  },
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter verification failed:", error);
  } else {
    console.log("Transporter is ready to send emails!");
  }
});

// Test email
const testEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: "singhansh6173@gmail.com", // <-- replace with your own email for testing
      subject: "Test Email from Nodemailer",
      text: "Hello! This is a test email to verify Nodemailer setup.",
    });

    console.log("Email sent successfully:", info.response);
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

testEmail();
