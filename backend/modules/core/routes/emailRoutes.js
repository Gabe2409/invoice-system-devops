/**
 * @fileoverview Email Routes - API endpoints for email operations
 * 
 * @module routes/emailRoutes
 * @requires express
 * @requires controllers/emailController
 * @requires services/emailService
 * @requires middleware/authMiddleware
 */

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { sendEmail, testEmailConfig } from "../services/emailService.js";
import Transaction from "../models/transaction.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

/**
 * Send receipt via email
 * @route POST /api/email/send-receipt
 */
router.post("/send-receipt", async (req, res) => {
  try {
    const { email, subject, text, pdfData, pdfFilename, transactionId } = req.body;

    // Validate required fields
    if (!email || !subject || !text) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (email, subject, text)",
      });
    }

    // If transactionId is provided, verify it exists
    if (transactionId) {
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }
    }

    // Send email
    const result = await sendEmail(email, subject, text, pdfData, pdfFilename, {
      transactionId,
    });

    res.status(200).json({
      success: true,
      message: "Receipt sent successfully",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Error sending receipt:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send receipt",
      error: error.message,
    });
  }
});

/**
 * Send receipt for a specific transaction
 * @route POST /api/email/send-transaction-receipt/:id
 */
router.post("/send-transaction-receipt/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { email } = req.body;

    // Fetch the transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Use provided email or the one in the transaction
    const recipientEmail = email || transaction.customerEmail;

    if (!recipientEmail) {
      return res.status(400).json({
        success: false,
        message: "No email address provided or found in transaction",
      });
    }

    // Generate email content
    const emailText = `
Dear ${transaction.customerName},

Thank you for your transaction. Please find your receipt attached.

Transaction ID: ${transaction.reference}
Date: ${new Date(transaction.createdAt).toLocaleString()}
Amount: ${transaction.currency} ${transaction.amount.toFixed(2)}
Type: ${transaction.type}

Regards,
${process.env.EMAIL_FROM_NAME || 'Your Business'}
    `;

    // Send email with transaction ID for PDF generation
    const result = await sendEmail(
      recipientEmail,
      `Receipt for Transaction ${transaction.reference}`,
      emailText,
      null,
      null,
      { transactionId }
    );

    res.status(200).json({
      success: true,
      message: "Receipt email sent successfully",
      transactionId,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Error sending transaction receipt:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send transaction receipt",
      error: error.message,
    });
  }
});

/**
 * Test email configuration
 * @route GET /api/email/test-config
 */
router.get("/test-config", async (req, res) => {
  try {
    // Check if we should send a test email
    const sendTestEmail = req.query.sendEmail === "true";
    const testEmailAddress = req.query.email || null;

    // If sending a test email but no email provided
    if (sendTestEmail && !testEmailAddress) {
      return res.status(400).json({
        success: false,
        message: "Email address is required when sending a test email",
      });
    }

    const result = await testEmailConfig(sendTestEmail, testEmailAddress);
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error("Error testing email config:", error);
    res.status(500).json({
      success: false,
      message: "Failed to test email configuration",
      error: error.message,
    });
  }
});

/**
 * Send test email
 * @route POST /api/email/send-test-email
 */
router.post("/send-test-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const result = await testEmailConfig(true, email);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message,
    });
  }
});

export default router;