/**
 * @fileoverview Email Service - Handles email operations
 * 
 * This service provides email functionality for the application, including
 * sending transaction receipts, test emails, and verifying email configuration.
 * 
 * @module services/emailService
 * @requires nodemailer
 * @requires dotenv
 * @requires models/transaction
 * @requires services/pdfService
 */

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Transaction from "../models/transaction.js";
import { generateTransactionPDF } from "./pdfService.js";

// Load environment variables
dotenv.config();

/**
 * Email configuration validation
 * @private
 */
const validateEmailConfig = () => {
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing email configuration: ${missing.join(', ')}`);
  }
};

// Validate required environment variables on import
validateEmailConfig();

/**
 * Create email transporter
 * @private
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter connection
transporter.verify()
  .then(() => console.log("✅ Email service ready"))
  .catch(err => console.error("❌ Email service error:", err));

/**
 * Generate HTML email template from plain text
 * 
 * @private
 * @param {string} text - Plain text email content
 * @returns {string} HTML formatted email
 */
const getHtmlTemplate = (text) => {
  // Convert plain text to HTML with paragraphs
  const htmlContent = text.split('\n\n').map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('');
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #f5f5f5; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
      .footer { font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Transaction Receipt</h2>
      </div>
      ${htmlContent}
      <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * Send email with optional transaction PDF attachment
 * 
 * @async
 * @param {string} email - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Email text content
 * @param {string|null} [pdfData=null] - Base64 encoded PDF data (optional)
 * @param {string|null} [pdfFilename=null] - PDF filename (optional)
 * @param {Object} [options={}] - Additional options
 * @param {string} [options.transactionId] - Transaction ID for PDF generation
 * @returns {Promise<Object>} Send result with success status and message ID
 * @throws {Error} If email sending fails
 */
export const sendEmail = async (email, subject, text, pdfData = null, pdfFilename = null, options = {}) => {
  try {
    // Validate email
    if (!email || !email.includes('@')) {
      throw new Error("Invalid email address");
    }

    // Create HTML version of the email
    const htmlContent = getHtmlTemplate(text);

    // Prepare attachments
    const attachments = [];
    
    // If transaction ID is provided but no PDF data, generate the PDF
    if (options.transactionId && !pdfData) {
      try {
        // Fetch transaction data from database
        const transaction = await Transaction.findById(options.transactionId);
        
        if (transaction) {
          // Generate PDF
          const pdfBuffer = await generateTransactionPDF(transaction);
          
          // Add PDF attachment
          attachments.push({
            filename: `receipt_${transaction.reference}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          });
        }
      } catch (error) {
        console.error("Error generating transaction PDF:", error);
        // Continue sending email without PDF if there's an error
      }
    }
    // If PDF data is directly provided
    else if (pdfData && pdfFilename) {
      attachments.push({
        filename: pdfFilename,
        content: Buffer.from(pdfData, "base64"),
        encoding: "base64",
      });
    }

    // Prepare mail options
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Your Business'}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: subject,
      text: text,
      html: htmlContent,
      attachments: attachments,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error in sendEmail function:", error);
    throw error;
  }
};

/**
 * Test email configuration and optionally send a test email
 * 
 * @async
 * @param {boolean} [sendTestEmail=false] - Whether to send test email
 * @param {string|null} [testEmailAddress=null] - Email address for test
 * @returns {Promise<Object>} Test result with success status and details
 */
export const testEmailConfig = async (sendTestEmail = false, testEmailAddress = null) => {
  try {
    // Verify SMTP connection
    await transporter.verify();
    
    // If requested, send a test email
    if (sendTestEmail && testEmailAddress) {
      const testMailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Your Business'}" <${process.env.EMAIL_FROM}>`,
        to: testEmailAddress,
        subject: "Test Email - Verification",
        text: "This is a test email to verify your email configuration is working correctly.",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #f5f5f5; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
              .footer { font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Email Configuration Test</h2>
              </div>
              <p>This is a test email to verify your email configuration is working correctly.</p>
              <p>If you received this email, your email sending system is properly configured!</p>
              <p>Timestamp: ${new Date().toISOString()}</p>
              <div class="footer">
                <p>This is an automated email for testing purposes. Please do not reply to this message.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };
      
      const info = await transporter.sendMail(testMailOptions);
      return { 
        success: true, 
        message: "Email configuration is valid and test email sent successfully", 
        emailSent: true,
        messageId: info.messageId
      };
    }
    
    return { success: true, message: "Email configuration is valid", emailSent: false };
  } catch (error) {
    console.error("Email configuration test failed:", error);
    return { 
      success: false, 
      message: "Email configuration is invalid", 
      emailSent: false,
      error: error.message 
    };
  }
};

/**
 * Generate email content for transaction receipt
 * 
 * @param {Object} transaction - Transaction object
 * @returns {string} Formatted email text
 */
export const generateReceiptEmailContent = (transaction) => {
  const {
    reference,
    customerName,
    amount,
    currency,
    type,
    createdAt,
    notes
  } = transaction;

  const formattedDate = new Date(createdAt).toLocaleString();
  const formattedAmount = `${currency} ${amount.toFixed(2)}`;

  return `
Dear ${customerName},

Thank you for your recent transaction. Below is your receipt information:

Transaction ID: ${reference}
Date: ${formattedDate}
Transaction Type: ${type}
Amount: ${formattedAmount}
${notes ? `Notes: ${notes}` : ''}

Please find your receipt attached.

Regards,
${process.env.EMAIL_FROM_NAME || 'Your Business'}
  `.trim();
};

export default { 
  sendEmail, 
  testEmailConfig,
  generateReceiptEmailContent
};