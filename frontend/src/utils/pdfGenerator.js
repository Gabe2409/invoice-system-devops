
import jsPDF from "jspdf";
import axios from "axios";

const GenerateReceiptPDF = async (transaction, sendEmail = false) => {
  if (!transaction) return;

  const { reference, createdAt, amount, notes, type, status, customerName, customerEmail } = transaction;

  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Transaction Receipt", 20, 20);

  doc.setFontSize(12);
  doc.text(`Transaction ID: ${reference}`, 20, 40);
  doc.text(`Date: ${new Date(createdAt).toLocaleString()}`, 20, 50);
  doc.text(`Customer Name: ${customerName}`, 20, 60);
  doc.text(`Customer Email: ${customerEmail}`, 20, 70);
  doc.text(`Amount: $${amount.toFixed(2)}`, 20, 80);
  doc.text(`Notes: ${notes || "N/A"}`, 20, 90);
  doc.text(`Type: ${type}`, 20, 100);
  doc.text(`Status: ${status}`, 20, 110);

  // Save locally
  if (!sendEmail) {
    doc.save(`receipt_${reference}.pdf`);
    return null;
  }

  // For email sending: convert to base64
  const pdfData = doc.output('datauristring');
  const base64Data = pdfData.split(',')[1]; // Remove the data URI prefix

  return {
    pdfData: base64Data,
    filename: `receipt_${reference}.pdf`
  };
};

// Function to send email with PDF
export const sendReceiptEmail = async (transaction) => {
  try {
    // Generate PDF for email
    const pdfInfo = await GenerateReceiptPDF(transaction, true);
    
    if (!pdfInfo) return { success: false, message: "Failed to generate PDF" };
    
    // Prepare email data
    const emailData = {
      email: transaction.customerEmail,
      subject: `Receipt for Transaction ${transaction.reference}`,
      text: `Dear ${transaction.customerName},\n\nThank you for your transaction. Please find your receipt attached.\n\nTransaction ID: ${transaction.reference}\nAmount: $${transaction.amount.toFixed(2)}\nDate: ${new Date(transaction.createdAt).toLocaleString()}\n\nRegards,\nYour Business Name`,
      pdfData: pdfInfo.pdfData,
      pdfFilename: pdfInfo.filename
    };

    // Send to backend
    const response = await axios.post('/api/email/send-receipt', emailData);
    return response.data;
  } catch (error) {
    console.error("Error sending receipt email:", error);
    return { success: false, message: "Failed to send receipt email" };
  }
};

export default GenerateReceiptPDF;