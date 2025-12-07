const sendEmail = require("../utils/sendemail");

// POST /api/contact
exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Compose email to admin
    const emailContent = `
      <h2>📩 New Contact Us Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `;

    // Send email
    await sendEmail(process.env.ADMIN_EMAIL, `📩 Contact Us: ${subject}`, emailContent);

    res.status(200).json({ message: "✅ Your message has been sent successfully!" });
  } catch (err) {
    console.error("Contact Controller Error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
};
