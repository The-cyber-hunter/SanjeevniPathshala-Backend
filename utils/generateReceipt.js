const PDFDocument = require("pdfkit");

const generateReceipt = (student, type, amount, forAdmin = false) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      let buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // ---------- Styles ----------
      const primaryColor = "#ec4899"; // Pink
      const secondaryColor = "#374151"; // Dark gray
      const titleFontSize = 24;
      const subtitleFontSize = 16;
      const textFontSize = 12;

      // ---------- Header ----------
      doc
        .fillColor(primaryColor)
        .fontSize(titleFontSize)
        .text("Sanjeevni Pathshala", { align: "center" });

      doc
        .fontSize(subtitleFontSize)
        .fillColor(secondaryColor)
        .text(
          type === "registration"
            ? "Registration Receipt"
            : "Monthly Payment Receipt",
          { align: "center" }
        );

      doc.moveDown(1.5);

      // ---------- Student Info ----------
      doc
        .fillColor(secondaryColor)
        .fontSize(textFontSize)
        .text(`Name: ${student.name}`)
        .text(`Email: ${student.email}`)
        .text(`Phone: ${student.phone}`)
        .text(`Class: ${student.class}`)
        .moveDown(1);

      // ---------- Payment Info ----------
      const dateOnly = new Date().toLocaleDateString("en-IN"); // India date only
      doc
        .fontSize(textFontSize + 2)
        .fillColor(primaryColor)
        .text(`Amount Paid: ${amount}`, { align: "left" , continued: false }) // prominent
        .moveDown(0.5);

      doc
        .fontSize(textFontSize)
        .fillColor(secondaryColor)
        .text(`Payment Type: ${type}`)
        .text(`Date: ${dateOnly}`)
        .moveDown(1);

      // ---------- Notes Section for Admin ----------
      if (forAdmin) {
        doc
          .fillColor(primaryColor)
          .fontSize(textFontSize)
          .text("Admin Notes:", { underline: true })
          .moveDown(0.3);

        doc
          .fillColor(secondaryColor)
          .fontSize(textFontSize)
          .text(
            `Student Email: ${student.email}`
          )
          .moveDown(1);
      }

      // ---------- Footer ----------
      const footerText = forAdmin
        ? "This is an internal receipt for admin reference."
        : "Thank you for your payment!";
      doc
        .fillColor(primaryColor)
        .fontSize(textFontSize + 1)
        .text(footerText, { align: "center" });

      // ---------- Optional Border ----------
      doc
        .strokeColor(primaryColor)
        .lineWidth(1)
        .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
        .stroke();

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateReceipt;

