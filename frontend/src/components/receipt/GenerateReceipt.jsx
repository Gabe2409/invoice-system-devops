import jsPDF from "jspdf";
const GenerateReceiptPDF = (transaction) => {
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
    doc.text(`Notes: ${notes}`, 20, 90);
    doc.text(`Type: ${type}`, 20, 100);
    doc.text(`Status: ${status}`, 20, 110);
  
    doc.save(`receipt_${reference}.pdf`);
  };

export default GenerateReceiptPDF;