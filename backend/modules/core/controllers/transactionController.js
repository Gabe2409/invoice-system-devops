/**
 * @fileoverview Transaction Controller - Manages financial transactions
 *
 * This controller handles all transaction operations including creating,
 * retrieving, updating, and deleting transactions with proper balance updates.
 *
 * @module controllers/transactionController
 * @requires mongoose
 * @requires models/transaction
 * @requires helpers/generateUniqueReference
 * @requires services/accountService
 * @requires services/emailService
 * @requires utils/errorHandler
 */

import mongoose from "mongoose";
import Transaction from "../models/transaction.js";
import generateUniqueReference from "../helpers/generateUniqueReference.js";
import AccountService from "../services/accountService.js";
import { sendEmail } from "../services/emailService.js";
import {
  sendSuccessResponse,
  sendErrorResponse,
  handleTransactionError,
} from "../utils/errorHandler.js";

/**
 * Create a new transaction with email receipt
 *
 * @async
 * @function createTransaction
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with transaction data or error
 * @description Creates a new financial transaction, updates account balances,
 *              and optionally sends an email receipt
 */
export const createTransaction = async (req, res) => {
  // Start a MongoDB transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      customerName,
      customerEmail,
      type,
      amount,
      currency,
      exchangeRate,
      amountTTD,
      notes,
      customerSignature,
    } = req.body;

    // Validate required fields
    if (!customerName || !type || !amount || !currency) {
      throw new Error("Missing required transaction fields");
    }

    // Validate transaction type
    if (!["Cash In", "Cash Out", "Buy", "Sell"].includes(type)) {
      throw new Error("Invalid transaction type");
    }

    // Validate numeric fields
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount: must be a positive number");
    }

    if (amountTTD && (isNaN(amountTTD) || amountTTD <= 0)) {
      throw new Error("Invalid TTD amount: must be a positive number");
    }

    if (exchangeRate && (isNaN(exchangeRate) || exchangeRate <= 0)) {
      throw new Error("Invalid exchange rate: must be a positive number");
    }

    // Check authentication
    if (!req.user) {
      return sendErrorResponse(res, 401, "Unauthorized");
    }

    // Generate unique reference
    const reference = await generateUniqueReference();

    // Validate balances before proceeding
    await AccountService.validateAccountBalances(
      type,
      currency,
      amount,
      amountTTD
    );

    // Create the transaction
    const transaction = await Transaction.create(
      [
        {
          reference,
          customerName,
          customerEmail,
          type,
          amount,
          currency,
          exchangeRate,
          amountTTD,
          notes,
          customerSignature,
          createdBy: req.user._id,
          status: "Completed",
        },
      ],
      { session } // Use the session
    );

    // Update account balances
    await AccountService.processAccountUpdates(
      type,
      currency,
      amount,
      amountTTD,
      session
    );

    // Commit the transaction if everything succeeded
    await session.commitTransaction();

    // Send email receipt if customer email is provided
    let emailResult = {
      success: false,
      message: "Email not sent (no email provided)",
    };
    if (customerEmail) {
      try {
        // Generate email content
        const emailContent = generateReceiptEmailContent(transaction[0]);

        // Send the email (PDF will be generated in emailService)
        emailResult = await sendEmail(
          customerEmail,
          `Receipt for Transaction ${reference}`,
          emailContent.text,
          null, // PDF will be generated in backend
          null, // PDF filename will be set in backend
          { transactionId: transaction[0]._id }
        );
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        emailResult = {
          success: false,
          message: "Transaction successful but failed to send email receipt",
        };
      }
    }

    // Return successful response with transaction and email status
    return sendSuccessResponse(res, 201, "Transaction created successfully", {
      ...transaction[0]._doc,
      emailReceipt: emailResult,
    });
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    return handleTransactionError(error, res);
  } finally {
    // End the session
    session.endSession();
  }
};

/**
 * Helper function to generate email content for receipt
 *
 * @private
 * @function generateReceiptEmailContent
 * @param {object} transaction - The transaction object
 * @returns {object} Object containing email text content
 */
function generateReceiptEmailContent(transaction) {
  const { reference, customerName, amount, currency, type, createdAt, notes } =
    transaction;

  const formattedDate = new Date(createdAt).toLocaleString();
  const formattedAmount = `${currency} ${amount.toFixed(2)}`;

  const text = `
Dear ${customerName},

Thank you for your recent transaction. Below is your receipt information:

Transaction ID: ${reference}
Date: ${formattedDate}
Transaction Type: ${type}
Amount: ${formattedAmount}
${notes ? `Notes: ${notes}` : ""}

Please find your receipt attached.

Regards,
Your Business Name
  `.trim();

  return { text };
}

/**
 * Send receipt for existing transaction
 *
 * @async
 * @function sendTransactionReceipt
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with email status or error
 * @description Sends an email receipt for an existing transaction
 */
export const sendTransactionReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendErrorResponse(res, 400, "Invalid transaction ID format");
    }

    // Find the transaction
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return sendErrorResponse(res, 404, "Transaction not found");
    }

    // Use provided email or the one in the transaction
    const recipientEmail = email || transaction.customerEmail;

    if (!recipientEmail) {
      return sendErrorResponse(
        res,
        400,
        "No email address provided or found in transaction"
      );
    }

    // Generate email content
    const emailContent = generateReceiptEmailContent(transaction);

    // Send email
    const emailResult = await sendEmail(
      recipientEmail,
      `Receipt for Transaction ${transaction.reference}`,
      emailContent.text,
      null, // PDF will be generated in backend
      null, // PDF filename will be set in backend
      { transactionId: transaction._id }
    );

    return sendSuccessResponse(res, 200, "Receipt email sent successfully", {
      transactionId: transaction._id,
      emailDetails: emailResult,
    });
  } catch (error) {
    return handleTransactionError(error, res);
  }
};

/**
 * Get transactions with pagination and filtering
 *
 * @async
 * @function getTransactions
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with transactions and pagination info or error
 * @description Returns transactions with flexible filtering, sorting, and pagination
 */
export const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = -1,
      currency,
      type,
      dateFrom,
      dateTo,
      search,
    } = req.query;

    // Build filter object
    const filter = {};

    if (currency) filter.currency = currency;
    if (type) filter.type = type;

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        // Set end of day for dateTo
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { reference: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Create sort object - Mongoose expects a number, not a string for sortOrder
    const sortDirection = parseInt(sortOrder) || -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortDirection;

    // Execute query with pagination
    const transactions = await Transaction.find(filter)
      .populate("createdBy", "userName fullName role")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Transaction.countDocuments(filter);

    return sendSuccessResponse(
      res,
      200,
      "Transactions retrieved successfully",
      {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      }
    );
  } catch (error) {
    return handleTransactionError(error, res);
  }
};

/**
 * Get a single transaction by ID
 *
 * @async
 * @function getTransactionById
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with transaction or error
 * @description Returns detailed information for a specific transaction
 */
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendErrorResponse(res, 400, "Invalid transaction ID format");
    }

    const transaction = await Transaction.findById(id).populate(
      "createdBy",
      "userName fullName role"
    );

    if (!transaction) {
      return sendErrorResponse(res, 404, "Transaction not found");
    }

    return sendSuccessResponse(res, 200, "Transaction retrieved successfully", {
      transaction,
    });
  } catch (error) {
    return handleTransactionError(error, res);
  }
};

/**
 * Update an existing transaction
 *
 * @async
 * @function updateTransaction
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with updated transaction or error
 * @description Updates non-financial details of a transaction
 */
export const updateTransaction = async (req, res) => {
  // Start a MongoDB transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendErrorResponse(res, 400, "Invalid transaction ID format");
    }

    // Find original transaction
    const originalTransaction = await Transaction.findById(id);

    if (!originalTransaction) {
      return sendErrorResponse(res, 404, "Transaction not found");
    }

    // Only allow updates to certain fields, not the core transaction data
    const allowedUpdates = ["notes", "customerSignature", "customerEmail"];
    const updates = {};

    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Validate email if provided
    if (updates.customerEmail && !updates.customerEmail.includes("@")) {
      return sendErrorResponse(res, 400, "Invalid email format");
    }

    // Apply the updates
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      updates,
      { new: true, session, runValidators: true }
    ).populate("createdBy", "userName fullName role");

    // Commit the transaction
    await session.commitTransaction();

    return sendSuccessResponse(res, 200, "Transaction updated successfully", {
      transaction: updatedTransaction,
    });
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    return handleTransactionError(error, res);
  } finally {
    // End the session
    session.endSession();
  }
};

/**
 * Delete a transaction with balance reversal
 *
 * @async
 * @function deleteTransaction
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with deletion status or error
 * @description Deletes a transaction and reverses related account balance changes
 */
export const deleteTransaction = async (req, res) => {
  // Start a MongoDB transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendErrorResponse(res, 400, "Invalid transaction ID format");
    }

    // Find transaction to reverse
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return sendErrorResponse(res, 404, "Transaction not found");
    }

    // Check if user has permission to delete
    // Admins or the creator can delete
    if (
      req.user.role !== "admin" &&
      transaction.createdBy.toString() !== req.user._id.toString()
    ) {
      return sendErrorResponse(
        res,
        403,
        "Not authorized to delete this transaction"
      );
    }

    // Reverse the account balance changes
    const { type, currency, amount, amountTTD } = transaction;
    await AccountService.reverseAccountUpdates(
      type,
      currency,
      amount,
      amountTTD,
      session
    );

    // Delete the transaction
    await Transaction.deleteOne({ _id: id }).session(session);

    // Commit the transaction
    await session.commitTransaction();

    return sendSuccessResponse(
      res,
      200,
      "Transaction deleted and balances reversed successfully",
      {
        transactionId: id,
      }
    );
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    return handleTransactionError(error, res);
  } finally {
    // End the session
    session.endSession();
  }
};

/**
 * Get transaction summary and analytics
 *
 * @async
 * @function getTransactionSummary
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with transaction summary or error
 * @description Returns aggregated transaction data with optional filtering
 */
export const getTransactionSummary = async (req, res) => {
  try {
    const { dateFrom, dateTo, currency } = req.query;

    // Build date filter
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = endDate;
      }
    }

    // Add currency filter if provided
    if (currency) {
      dateFilter.currency = currency;
    }

    // Pipeline for aggregation
    const pipeline = [
      { $match: dateFilter },
      {
        $group: {
          _id: {
            type: "$type",
            currency: "$currency",
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          totalTTD: { $sum: "$amountTTD" },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id.type",
          currency: "$_id.currency",
          count: 1,
          totalAmount: 1,
          totalTTD: 1,
        },
      },
      { $sort: { currency: 1, type: 1 } },
    ];

    const summary = await Transaction.aggregate(pipeline);

    // Get current account balances
    const accounts = await AccountService.getAllAccountBalances();

    return sendSuccessResponse(
      res,
      200,
      "Transaction summary retrieved successfully",
      {
        summary,
        accounts,
      }
    );
  } catch (error) {
    return handleTransactionError(error, res);
  }
};

export default {
  createTransaction,
  sendTransactionReceipt,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
};
