const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter at startup
transporter.verify((err, success) => {
  if (err) console.error("Email transporter error:", err);
  else console.log("Email transporter ready");
});

/**
 * Send email with optional attachments
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email body in HTML (can be empty if using text)
 * @param {Array} attachments - Optional attachments [{filename, content}]
 */
const sendEmail = async (to, subject, html = "", attachments = []) => {
  try {
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to,
      subject,
      html,
      attachments, // PDF or other files
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (err) {
    console.error("Email send error:", err);
  }
};

module.exports = sendEmail;
