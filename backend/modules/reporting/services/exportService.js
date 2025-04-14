/**
 * @fileoverview Export Service - Handles exporting data in various formats
 *
 * This service provides functions to export transaction data in CSV, PDF,
 * and other formats for reporting purposes.
 *
 * @module services/exportService
 * @requires csv-writer
 * @requires pdfkit
 */

import { createObjectCsvStringifier } from 'csv-writer';
import PDFDocument from 'pdfkit';

/**
 * Generate CSV export from transaction data
 *
 * @function generateCsvExport
 * @param {Array} transactions - Array of transaction objects
 * @returns {string} CSV formatted string
 */
export function generateCsvExport(transactions) {
  // Define CSV headers
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'reference', title: 'Reference' },
      { id: 'customerName', title: 'Customer Name' },
      { id: 'customerEmail', title: 'Customer Email' },
      { id: 'type', title: 'Type' },
      { id: 'amount', title: 'Amount' },
      { id: 'currency', title: 'Currency' },
      { id: 'amountTTD', title: 'Amount (TTD)' },
      { id: 'exchangeRate', title: 'Exchange Rate' },
      { id: 'status', title: 'Status' },
      { id: 'createdAt', title: 'Date' },
      { id: 'notes', title: 'Notes' }
    ]
  });

  // Format the data for CSV
  const formattedTransactions = transactions.map(tx => ({
    reference: tx.reference,
    customerName: tx.customerName,
    customerEmail: tx.customerEmail,
    type: tx.type,
    amount: tx.amount ? tx.amount.toFixed(2) : '0.00',
    currency: tx.currency,
    amountTTD: tx.amountTTD ? tx.amountTTD.toFixed(2) : '',
    exchangeRate: tx.exchangeRate ? tx.exchangeRate.toFixed(4) : '',
    status: tx.status,
    createdAt: new Date(tx.createdAt).toISOString().split('T')[0],
    notes: tx.notes
  }));

  // Generate the CSV content
  const headerString = csvStringifier.getHeaderString();
  const recordString = csvStringifier.stringifyRecords(formattedTransactions);
  
  return headerString + recordString;
}

/**
 * Generate PDF export from transaction data
 *
 * @function generatePdfExport
 * @param {Array} transactions - Array of transaction objects
 * @returns {Buffer} PDF document as a buffer
 */
export function generatePdfExport(transactions) {
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });
      
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Add title
      doc.fontSize(18).text('Transaction Report', { align: 'center' });
      doc.moveDown();
      
      // Add report generation date
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);
      
      // Add transaction count
      doc.fontSize(12).text(`Total Transactions: ${transactions.length}`, { align: 'left' });
      doc.moveDown();
      
      // Create table
      const tableTop = 160;
      const tableLeft = 50;
      const colWidths = [80, 100, 60, 70, 70, 100];
      const colHeaders = ['Reference', 'Customer', 'Type', 'Amount', 'Currency', 'Date'];
      
      // Draw table headers
      doc.fontSize(10).font('Helvetica-Bold');
      let currentLeft = tableLeft;
      
      colHeaders.forEach((header, i) => {
        doc.text(header, currentLeft, tableTop);
        currentLeft += colWidths[i];
      });
      
      doc.moveDown();
      doc.font('Helvetica');
      
      // Draw table rows
      let rowTop = tableTop + 20;
      
      transactions.forEach((tx, index) => {
        // Limit to reasonable number of entries to prevent oversized PDFs
        if (index < 100) {
          currentLeft = tableLeft;
          
          // Reference
          doc.text(tx.reference, currentLeft, rowTop);
          currentLeft += colWidths[0];
          
          // Customer
          doc.text(tx.customerName.substring(0, 15), currentLeft, rowTop);
          currentLeft += colWidths[1];
          
          // Type
          doc.text(tx.type, currentLeft, rowTop);
          currentLeft += colWidths[2];
          
          // Amount
          doc.text(tx.amount ? tx.amount.toFixed(2) : '0.00', currentLeft, rowTop);
          currentLeft += colWidths[3];
          
          // Currency
          doc.text(tx.currency, currentLeft, rowTop);
          currentLeft += colWidths[4];
          
          // Date
          doc.text(new Date(tx.createdAt).toLocaleDateString(), currentLeft, rowTop);
          
          rowTop += 20;
          
          // Add page break if needed
          if (rowTop > 700) {
            doc.addPage();
            rowTop = 50;
            doc.fontSize(10).text('Transaction Report (continued)', { align: 'center' });
            doc.moveDown(2);
          }
        }
      });
      
      // If there are more transactions than shown in the PDF
      if (transactions.length > 100) {
        doc.moveDown();
        doc.text(`Note: Only showing first 100 of ${transactions.length} transactions.`, { align: 'center' });
      }
      
      // Summary section
      if (transactions.length > 0) {
        doc.addPage();
        doc.fontSize(14).text('Transaction Summary', { align: 'center' });
        doc.moveDown();
        
        // Calculate summaries by currency and type
        const currencySummary = {};
        const typeSummary = {};
        
        transactions.forEach(tx => {
          // Currency summary
          if (!currencySummary[tx.currency]) {
            currencySummary[tx.currency] = {
              count: 0,
              totalAmount: 0
            };
          }
          currencySummary[tx.currency].count += 1;
          currencySummary[tx.currency].totalAmount += tx.amount || 0;
          
          // Type summary
          if (!typeSummary[tx.type]) {
            typeSummary[tx.type] = {
              count: 0,
              totalAmount: 0
            };
          }
          typeSummary[tx.type].count += 1;
          typeSummary[tx.type].totalAmount += tx.amount || 0;
        });
        
        // Display currency summary
        doc.fontSize(12).text('Summary by Currency', { underline: true });
        doc.moveDown();
        
        Object.entries(currencySummary).forEach(([currency, data]) => {
          doc.fontSize(10).text(`${currency}: ${data.count} transactions, Total: ${data.totalAmount.toFixed(2)} ${currency}`);
        });
        
        doc.moveDown(2);
        
        // Display type summary
        doc.fontSize(12).text('Summary by Transaction Type', { underline: true });
        doc.moveDown();
        
        Object.entries(typeSummary).forEach(([type, data]) => {
          doc.fontSize(10).text(`${type}: ${data.count} transactions, Total Amount: ${data.totalAmount.toFixed(2)}`);
        });
      }
      
      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(new Error('Failed to generate PDF export'));
    }
  });
}

/**
 * Helper function to format date for reports
 * 
 * @function formatDate
 * @param {Date} date - Date object to format
 * @param {string} format - Output format (short, long, etc.)
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'short') {
  if (!date) return '';
  
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  } else if (format === 'long') {
    return d.toLocaleString(); // Full date and time
  } else {
    return d.toLocaleDateString(); // Just date in local format
  }
}

export default {
  generateCsvExport,
  generatePdfExport,
  formatDate
};