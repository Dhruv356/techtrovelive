const PDFDocument = require("pdfkit");

const sendInvoiceEmail = async (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      const formatCurrency = (amount) =>
        "₹ " + amount.toLocaleString("en-IN", { minimumFractionDigits: 2 });

      // ============ HEADER ============ //
      doc
        .fillColor("#2E3A59")
        .fontSize(26)
        .font("Helvetica-Bold")
        .text("TechTrove", { align: "left" })
        .moveDown(1);

      // Adjust logo position to avoid overlap with title
      doc.image("./logo1.png", 400, 40, { width: 50 });

      doc
        .fontSize(12)
        .fillColor("#444")
        .text("www.techtrove.com", 50, doc.y)
        .text("support@techtrove.com")
        .moveDown(1);

      // INVOICE BADGE
      doc
        .fillColor("#fff")
        .rect(400, 90, 140, 30)
        .fill("#F04E4E")
        .fillColor("#fff")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("INVOICE", 410, 98)
        .moveDown(2);

      // ============ BILLING & ORDER INFO ============ //
      const leftStart = 50;
      const rightStart = 320;
      const lineHeight = 16;

      // Add some padding to avoid overlap with other sections
      doc
        .fontSize(12)
        .fillColor("#000")
        .font("Helvetica-Bold")
        .text("Billed To:", leftStart, doc.y + 20); // Added some spacing here
    
      doc
        .font("Helvetica")
        .fillColor("#444")
        .text(user.name, leftStart, doc.y + lineHeight + 20)
        .text(user.email, leftStart, doc.y + 2 * lineHeight + 20)
        .text(user.phone, leftStart, doc.y + 3 * lineHeight + 20)
        .text(order.shippingAddress, leftStart, doc.y + 4 * lineHeight + 20);
    
      doc.moveDown(2); // Add extra space after the section for better readability
    
      doc
        .font("Helvetica-Bold")
        .fillColor("#000")
        .text("Invoice Date:", rightStart, 130)
        .font("Helvetica")
        .fillColor("#444")
        .text(new Date(order.createdAt).toLocaleDateString(), rightStart + 90, 130);

      doc
        .font("Helvetica-Bold")
        .fillColor("#000")
        .text("Order ID:", rightStart, 146)
        .font("Helvetica")
        .fillColor("#444")
        .text(order._id, rightStart + 90, 146);

      doc
        .font("Helvetica-Bold")
        .fillColor("#000")
        .text("Payment:", rightStart, 162)
        .font("Helvetica")
        .fillColor("#444")
        .text(order.paymentMethod, rightStart + 90, 162);

      doc.moveDown(2);

      // ============ ORDER TABLE ============ //
      const tableTop = doc.y + 10;
      const headers = ["#", "Product", "Price", "Qty", "Total"];
      const columnWidths = [30, 200, 80, 50, 80];
      const tableLeft = 50;

      // Draw Header
      doc
        .font("Helvetica-Bold")
        .fillColor("#fff")
        .rect(tableLeft, tableTop, 500, 25)
        .fill("#222831");

      headers.forEach((h, i) => {
        doc
          .fillColor("#fff")
          .text(h, tableLeft + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5, tableTop + 7);
      });

      doc.fillColor("#000").font("Helvetica").fontSize(11);
      let y = tableTop + 30;

      order.items.forEach((item, index) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        const isEvenRow = index % 2 === 0;
        if (isEvenRow) {
          doc
            .fillColor("#f9f9f9")
            .rect(tableLeft, y, 500, 25)
            .fill("#f9f9f9");
        }

        const itemTotal = item.price * item.quantity;

        const rowData = [
          index + 1,
          item.name,
          formatCurrency(item.price),
          item.quantity,
          formatCurrency(itemTotal),
        ];

        rowData.forEach((data, i) => {
          doc
            .fillColor("#000")
            .text(data, tableLeft + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5, y + 7);
        });

        y += 25;
      });

      // ============ TOTALS ============ //
      const subtotal = order.totalPrice / 1.18;
      const tax = order.totalPrice - subtotal;

      doc.moveTo(350, y + 10).lineTo(550, y + 10).stroke("#ccc");

      doc
        .font("Helvetica-Bold")
        .fillColor("#000")
        .fontSize(12)
        .text("Subtotal:", 400, y + 20, { align: "right", width: 100 })
        .text("Tax (18%):", 400, y + 40, { align: "right", width: 100 })
        .text("Shipping:", 400, y + 60, { align: "right", width: 100 })
        .text("Total:", 400, y + 80, { align: "right", width: 100 });

      doc
        .font("Helvetica")
        .text(formatCurrency(subtotal), 500, y + 20, { align: "right" })
        .text(formatCurrency(tax), 500, y + 40, { align: "right" })
        .text("₹ 0.00", 500, y + 60, { align: "right" })
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(formatCurrency(order.totalPrice), 500, y + 80, { align: "right" });

      // ============ FOOTER ============ //
      doc.moveDown(6);
      doc
        .font("Helvetica-Oblique")
        .fontSize(10)
        .fillColor("#666")
        .text("This invoice is system generated and does not require signature.", { align: "center" })
        .text("Thank you for shopping with TechTrove!", { align: "center" });

      doc.end();
    } catch (error) {
      console.error("❌ Error generating invoice:", error);
      reject(error);
    }
  });
};

module.exports = sendInvoiceEmail;
