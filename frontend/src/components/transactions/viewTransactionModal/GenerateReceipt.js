import jsPDF from "jspdf";

/**
 * Generates a PDF receipt for a transaction and downloads it
 * @param {Object} transaction - The transaction data
 */
const GenerateReceiptPDF = (transaction) => {
  if (!transaction) return;

  const { 
    reference, 
    createdAt, 
    amount, 
    amountTTD,
    notes, 
    type, 
    status, 
    customerName, 
    customerEmail,
    currency,
    exchangeRate,
    createdBy
  } = transaction;

  // Setup PDF
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
  
  // Add some styling
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  
  // Title
  doc.text("Transaction Receipt", 105, 20, { align: "center" });
  
  // Add company logo/name
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(import.meta.env.VITE_APP_NAME || "Transaction System", 105, 30, { align: "center" });
  
  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 35, 190, 35);
  
  // Transaction information
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  let yPosition = 45;
  const leftMargin = 20;
  const rightColumn = 80;
  
  // Transaction Reference
  doc.setFont(undefined, 'bold');
  doc.text("Transaction Reference:", leftMargin, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(reference || "N/A", rightColumn, yPosition);
  yPosition += 10;
  
  // Type & Status
  doc.setFont(undefined, 'bold');
  doc.text("Type:", leftMargin, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(type || "N/A", rightColumn, yPosition);
  yPosition += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text("Status:", leftMargin, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(status || "Completed", rightColumn, yPosition);
  yPosition += 10;
  
  // Date & Time
  const dateString = createdAt 
    ? new Date(createdAt).toLocaleString() 
    : "N/A";
  doc.setFont(undefined, 'bold');
  doc.text("Date & Time:", leftMargin, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(dateString, rightColumn, yPosition);
  yPosition += 15;
  
  // Customer Details
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.setFont(undefined, 'bold');
  doc.text("Customer Information", leftMargin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text("Name:", leftMargin, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(customerName || "N/A", rightColumn, yPosition);
  yPosition += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text("Email:", leftMargin, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(customerEmail || "N/A", rightColumn, yPosition);
  yPosition += 15;
  
  // Transaction Amount
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.setFont(undefined, 'bold');
  doc.text("Transaction Amount", leftMargin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text(`Amount (${currency}):`, leftMargin, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(amount.toFixed(2).toString(), rightColumn, yPosition);
  yPosition += 10;
  
  // Show exchange rate and TTD amount for Buy/Sell
  if (["Buy", "Sell"].includes(type) && exchangeRate > 0) {
    doc.setFont(undefined, 'bold');
    doc.text("Exchange Rate:", leftMargin, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(exchangeRate.toString(), rightColumn, yPosition);
    yPosition += 10;
    
    doc.setFont(undefined, 'bold');
    doc.text("Amount (TTD):", leftMargin, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(amountTTD.toFixed(2).toString(), rightColumn, yPosition);
    yPosition += 10;
  }
  
  // Notes
  if (notes) {
    yPosition += 5;
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.setFont(undefined, 'bold');
    doc.text("Notes", leftMargin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    
    // Handle multi-line notes
    const splitNotes = doc.splitTextToSize(notes, 150);
    doc.text(splitNotes, leftMargin, yPosition);
    yPosition += 10 * (splitNotes.length);
  }
  
  // Footer
  yPosition = Math.max(yPosition + 15, 230); // Ensure footer is at bottom if content is short
  
  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 10;
  
  // Additional information
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  
  // Processed by
  if (createdBy && createdBy.fullName) {
    doc.text(`Processed by: ${createdBy.fullName}`, leftMargin, yPosition);
    yPosition += 5;
  }
  
  // Generation timestamp
  const generatedDate = new Date().toLocaleString();
  doc.text(`Receipt generated: ${generatedDate}`, leftMargin, yPosition);
  yPosition += 5;
  
  // Thank you message
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text("Thank you for your business!", 105, yPosition + 10, { align: "center" });
  
  // Save the PDF
  doc.save(`${reference}_receipt.pdf`);
};

export default GenerateReceiptPDF;