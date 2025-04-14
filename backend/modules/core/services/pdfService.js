/**
 * @fileoverview PDF Service - Handles PDF generation
 * 
 * This service provides PDF document generation for transaction receipts
 * and other documents in the application.
 * 
 * @module services/pdfService
 * @requires pdfkit
 */

import PDFDocument from 'pdfkit';

/**
 * Generate a PDF receipt for a transaction
 * 
 * @async
 * @param {Object} transaction - The transaction object
 * @param {string} transaction.reference - Transaction reference number
 * @param {string} transaction.customerName - Customer name
 * @param {string} transaction.customerEmail - Customer email
 * @param {string} transaction.type - Transaction type
 * @param {number} transaction.amount - Transaction amount
 * @param {string} transaction.currency - Currency code
 * @param {number} transaction.amountTTD - Equivalent amount in TTD
 * @param {string} transaction.notes - Transaction notes
 * @param {Date} transaction.createdAt - Transaction creation date
 * @returns {Promise<Buffer>} The generated PDF as a buffer
 * @throws {Error} If PDF generation fails
 */
export const generateTransactionPDF = async (transaction) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document with options
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        info: {
          Title: `Transaction Receipt - ${transaction.reference}`,
          Author: 'Transaction Management System',
          Subject: 'Transaction Receipt',
          Keywords: 'receipt, transaction, currency exchange'
        }
      });

      // Collection for data chunks
      const buffers = [];

      // Collect data chunks
      doc.on('data', buffer => buffers.push(buffer));
      
      // Resolve with the buffer when done
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Handle errors
      doc.on('error', err => reject(err));

      // Extract transaction data
      const {
        reference,
        customerName,
        customerEmail,
        type,
        amount,
        currency,
        amountTTD,
        notes,
        createdAt
      } = transaction;

      // Format date
      const formattedDate = new Date(createdAt).toLocaleString();
      
      // Add company logo/header
      doc.fontSize(20).text('Transaction Receipt', { align: 'center' });
      doc.moveDown();

      // Add a line
      doc.strokeColor('#aaaaaa')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      doc.moveDown();

      // Add transaction details
      doc.fontSize(12);
      
      // Add two columns for transaction details
      const detailsY = doc.y;
      
      // Left column
      doc.text('Transaction Details:', 50, detailsY);
      doc.moveDown();
      doc.text(`Transaction ID: ${reference}`);
      doc.moveDown(0.5);
      doc.text(`Date: ${formattedDate}`);
      doc.moveDown(0.5);
      doc.text(`Type: ${type}`);
      doc.moveDown(0.5);
      doc.text(`Amount: ${currency} ${amount.toFixed(2)}`);
      if (amountTTD) {
        doc.moveDown(0.5);
        doc.text(`Amount (TTD): TTD ${amountTTD.toFixed(2)}`);
      }
      
      // Right column
      doc.text('Customer Information:', 300, detailsY);
      doc.moveDown();
      doc.text(`Name: ${customerName}`, 300);
      if (customerEmail) {
        doc.moveDown(0.5);
        doc.text(`Email: ${customerEmail}`, 300);
      }
      
      // Notes
      if (notes && notes.trim().length > 0) {
        doc.moveDown(2);
        doc.text('Notes:');
        doc.moveDown(0.5);
        doc.text(notes);
      }
      
      // Footer
      doc.moveDown(2);
      const timestamp = new Date().toLocaleString();
      doc.fontSize(10)
        .text('Thank you for your business!', { align: 'center' })
        .moveDown(0.5)
        .text(`This receipt was generated on ${timestamp}`, { align: 'center' })
        .moveDown(1);
      
      // Add a line
      doc.strokeColor('#aaaaaa')
        .lineWidth(0.5)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      
      doc.moveDown(0.5)
        .fontSize(8)
        .text('This is an official receipt from our transaction management system.', { align: 'center' });

      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(error);
    }
  });
};

/**
 * Generate a generic PDF document
 * 
 * @async
 * @param {string} title - Document title
 * @param {Object} content - Content object
 * @param {string} content.text - Text content
 * @param {Object} [options={}] - PDF options
 * @returns {Promise<Buffer>} The generated PDF as a buffer
 * @throws {Error} If PDF generation fails
 */
export const generateGenericPDF = async (title, content, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({ 
        margin: 50,
        size: options.size || 'A4',
        info: {
          Title: title,
          Author: options.author || 'Transaction Management System',
          Subject: options.subject || 'Generated Document',
          Keywords: options.keywords || 'document, report, pdf'
        }
      });

      // Collection for data chunks
      const buffers = [];

      // Collect data chunks
      doc.on('data', buffer => buffers.push(buffer));
      
      // Resolve with the buffer when done
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Handle errors
      doc.on('error', err => reject(err));

      // Add title
      doc.fontSize(16).text(title, { align: 'center' });
      doc.moveDown();

      // Add content
      doc.fontSize(12).text(content.text || '');
      
      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error('Error generating generic PDF:', error);
      reject(error);
    }
  });
};

export default { 
  generateTransactionPDF,
  generateGenericPDF
};