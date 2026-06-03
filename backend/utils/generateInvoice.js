const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

/**
 * Utility helper to draw clean horizontal lines across the PDF canvas
 */
function drawHorizontalLine(doc, y) {
  doc.strokeColor("#E5E7EB").lineWidth(1).moveTo(50, y).lineTo(562, y).stroke();
}

/**
 * Generates a dynamic, highly polished PDF Invoice containing explicit cart line items,
 * saves it to the static assets directory, and dispatches an attachment email to the customer.
 */
async function generateInvoice(order) {
  const invoiceNumber = order.invoiceNumber || "INV-" + Date.now();
  const invoicesDir = path.join(__dirname, "../invoices");

  // Ensure target directory exists on disk to prevent filesystem write exceptions
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const invoicePath = path.join(invoicesDir, `${invoiceNumber}.pdf`);
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // Pipe the document data to a local write stream
  const writeStream = fs.createWriteStream(invoicePath);
  doc.pipe(writeStream);

  // ==================== BRAND HEADER ====================
  doc.fillColor("#D4AF37").font("Helvetica-Bold").fontSize(28).text("JAGA TRADERS", 50, 50);
  doc.fillColor("#6B7280").font("Helvetica").fontSize(9).text("Your Court, Your Style, Your Gear.", 50, 82);
  
  doc.fillColor("#1F2937").font("Helvetica-Bold").fontSize(18).text("INVOICE", 400, 50, { align: "right" });
  doc.fillColor("#4B5563").font("Helvetica").fontSize(9)
     .text(`Invoice No: ${invoiceNumber}`, 400, 72, { align: "right" })
     .text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 400, 85, { align: "right" });

  drawHorizontalLine(doc, 110);

  // ==================== CUSTOMER & TRANSACTION METADATA ====================
  doc.fillColor("#1F2937").font("Helvetica-Bold").fontSize(11).text("BILLED TO:", 50, 130);
  doc.fillColor("#4B5563").font("Helvetica").fontSize(10)
     .text(`Name: ${order.customerName}`, 50, 148)
     .text(`Email: ${order.customerEmail}`, 50, 163);

  doc.fillColor("#1F2937").font("Helvetica-Bold").fontSize(11).text("TRANSACTION DETAILS:", 320, 130);
  doc.fillColor("#4B5563").font("Helvetica").fontSize(10)
     .text(`Razorpay Order ID: ${order.razorpay_order_id || order.order_id || "N/A"}`, 320, 148)
     .text(`Payment Gateway ID: ${order.payment_id}`, 320, 163);

  drawHorizontalLine(doc, 195);

  // ==================== INVOICE TABLE HEADERS ====================
  let currentY = 215;
  doc.fillColor("#1F2937").font("Helvetica-Bold").fontSize(10);
  doc.text("Product Description & Match Specifications", 50, currentY);
  doc.text("Qty", 360, currentY, { width: 30, align: "center" });
  doc.text("Unit Price", 410, currentY, { width: 70, align: "right" });
  doc.text("Total Amount", 495, currentY, { width: 67, align: "right" });

  drawHorizontalLine(doc, 230);

  // ==================== DYNAMIC TABLE BODY (LINE ITEMS ITERATION) ====================
  currentY = 245;
  doc.fillColor("#4B5563").font("Helvetica").fontSize(10);

  let computedSubtotal = 0;

  // Verify if explicit items array data is mapped, fallback to order summary parameters safely
  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [
    {
      product: {
        name: order.productName || "Premium Badminton Gear Bundle",
        category: order.productCategory || "Gear",
        price: Math.round(order.amount / 1.18) // Derive subtotal mapping from aggregate payload values
      },
      qty: 1
    }
  ];

  items.forEach((item) => {
    // Structural safeguards against empty child data properties
    const prodName = item.product?.name || "Badminton Item";
    const prodCat = (item.product?.category || "Equipment").toUpperCase();
    const quantity = item.qty || 1;
    const unitPrice = Number(item.product?.price || 0);
    const rowTotal = unitPrice * quantity;
    
    computedSubtotal += rowTotal;

    // Check canvas height bounds dynamically to prevent rendering layout over footers
    if (currentY > 650) {
      doc.addPage();
      currentY = 50;
    }

    // Print Description Name & Secondary Category tags
    doc.fillColor("#1F2937").font("Helvetica-Bold").text(prodName, 50, currentY, { width: 290 });
    doc.fillColor("#9CA3AF").font("Helvetica").fontSize(8).text(`CATEGORY: ${prodCat}`, 50, currentY + 13);
    
    // Print Quantities, Unit Costs, and Row Totals
    doc.fillColor("#4B5563").font("Helvetica").fontSize(10);
    doc.text(quantity.toString(), 360, currentY, { width: 30, align: "center" });
    doc.text(`₹${unitPrice.toLocaleString("en-IN")}`, 410, currentY, { width: 70, align: "right" });
    doc.text(`₹${rowTotal.toLocaleString("en-IN")}`, 495, currentY, { width: 67, align: "right" });

    // Step down Y-axis positions to clear layout blocks cleanly
    currentY += 35;
  });

  drawHorizontalLine(doc, currentY);

  // ==================== FINANCIAL SUMMARY BREAKDOWN ====================
  let summaryY = currentY + 20;
  
  // Guard canvas limits to wrap columns neatly over totals boxes
  if (summaryY > 600) {
    doc.addPage();
    summaryY = 50;
  }

  // Exact Tax breakdowns modeled from cumulative line item computations
  const gstTaxAmount = Math.round(computedSubtotal * 0.18);
  const aggregateTotal = computedSubtotal + gstTaxAmount;

  doc.fillColor("#4B5563").font("Helvetica").fontSize(10);
  doc.text("Subtotal:", 360, summaryY, { width: 100, align: "right" });
  doc.text(`₹${computedSubtotal.toLocaleString("en-IN")}`, 480, summaryY, { width: 82, align: "right" });

  doc.text("GST (18%):", 360, summaryY + 18, { width: 100, align: "right" });
  doc.text(`₹${gstTaxAmount.toLocaleString("en-IN")}`, 480, summaryY + 18, { width: 82, align: "right" });

  doc.text("Shipping:", 360, summaryY + 36, { width: 100, align: "right" });
  doc.text(aggregateTotal >= 2999 ? "FREE" : "₹99", 480, summaryY + 36, { width: 82, align: "right" });

  // Final Calculated Grand Total Anchor Box
  const targetGrandTotal = order.amount || (aggregateTotal + (aggregateTotal >= 2999 ? 0 : 99));
  
  doc.rect(340, summaryY + 56, 225, 32).fill("#F9FAFB");
  doc.fillColor("#D4AF37").font("Helvetica-Bold").fontSize(11);
  doc.text("GRAND TOTAL:", 350, summaryY + 67);
  doc.text(`₹${Number(targetGrandTotal).toLocaleString("en-IN")}`, 480, summaryY + 67, { width: 82, align: "right" });

  // ==================== FOOTER BRAND STAMPS ====================
  doc.fillColor("#9CA3AF").font("Helvetica").fontSize(9)
     .text("Thank you for choosing Jaga Traders to power your match days.", 50, 725, { align: "center" })
     .text("This is a computer-generated document. No signature authorization required.", 50, 740, { align: "center" });

  doc.end();

  // Await local storage stream resolution loops safely before starting outgoing SMTP mail workers
  await new Promise((resolve) => writeStream.on("finish", resolve));

  // ==================== AUTOMATED NODEMAILER TRANSMISSION SERVICE ====================
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Jaga Traders Support" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject: `🏸 Order Confirmed! Invoice #${invoiceNumber} — Jaga Traders`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #D4AF37; margin: 0; font-size: 26px; letter-spacing: 1px;">JAGA TRADERS</h1>
            <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0 0;">YOUR COURT • YOUR STYLE • YOUR GEAR</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <h3 style="color: #1f2937; margin-top: 0;">MATCH DAY ORDER CONFIRMED!</h3>
          <p>Hello <strong>${order.customerName}</strong>,</p>
          <p>Thank you for placing your confidence in our gear setup. Your payment of <strong>₹${Number(targetGrandTotal).toLocaleString("en-IN")}</strong> has successfully cleared processing metrics.</p>
          <p>We are currently packing your selection for transit dispatch. Your comprehensive breakdown receipts have been parsed and securely appended to this email as a downloadable PDF attachment.</p>
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #4b5563;"><strong>Invoice Reference:</strong> ${invoiceNumber}</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #4b5563;"><strong>Tracking Logistics Status:</strong> Pending Dispatch</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
          <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">This is an automated system confirmation tracking link notification layout.</p>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice-${invoiceNumber}.pdf`,
          path: invoicePath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`Invoice email document generated and dispatched to client mailbox: ${order.customerEmail}`);
  } catch (mailError) {
    console.error("Critical error while compiling / executing SMTP transmission layout routine:", mailError);
  }

  return {
    invoiceNumber,
    invoicePath,
  };
}

module.exports = generateInvoice;