const PDFDocument = require("pdfkit");

const generateReceipt = (student, type, amount) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // Header
      doc.fontSize(20).text("Sanjeevni Pathshala", { align: "center" });
      doc.fontSize(16).text(
        type === "registration"
          ? "Registration Receipt"
          : "Monthly Payment Receipt",
        { align: "center" }
      );
      doc.moveDown(2);

      // Student Info
      doc.fontSize(12).text(`Name: ${student.name}`);
      doc.text(`Email: ${student.email}`);
      doc.text(`Phone: ${student.phone}`);
      doc.text(`Class: ${student.class}`);
      doc.moveDown(1);

      // Payment Info
      doc.text(`Payment Type: ${type}`);
      doc.text(`Amount Paid: ₹${amount}`);
      doc.text(`Date: ${new Date().toLocaleString()}`);
      doc.moveDown(2);

      doc.text("Thank you for your payment!", { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateReceipt;
