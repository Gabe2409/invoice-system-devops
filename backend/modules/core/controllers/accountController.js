/**
 * @fileoverview Account Controller - Manages account-related API endpoints
 * 
 * This controller handles account retrieval operations, providing access to 
 * currency-specific account balances in the system.
 * 
 * @module controllers/accountController
 * @requires models/account
 * @requires utils/errorHandler
 */

import Account from "../models/account.js";
import { sendSuccessResponse, handleMongoDBError } from "../utils/errorHandler.js";

/**
 * Retrieve all accounts and their balances
 * 
 * @async
 * @function getAccounts
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with account data or error
 * @description Returns an array of all currency accounts with their balances
 */
export const getAccounts = async (req, res) => {
  try {
    // Retrieve all accounts
    const accounts = await Account.find().select("currency balance");
    
    // Return accounts as JSON response
    return sendSuccessResponse(res, 200, "Accounts retrieved successfully", { accounts });
  } catch (error) {
    return handleMongoDBError(error, res);
  }
};

/**
 * Get account balance by currency
 * 
 * @async
 * @function getAccountByCurrency
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with account data or error
 * @description Returns the account for the specified currency
 */
export const getAccountByCurrency = async (req, res) => {
  try {
    const { currency } = req.params;
    
    if (!currency) {
      return sendErrorResponse(res, 400, "Currency is required");
    }
    
    // Find account by currency (case-insensitive)
    const account = await Account.findOne({ 
      currency: { $regex: new RegExp(`^${currency}$`, 'i') } 
    });
    
    // Handle account not found
    if (!account) {
      return sendErrorResponse(res, 404, `Account for currency ${currency} not found`);
    }
    
    return sendSuccessResponse(res, 200, "Account retrieved successfully", { account });
  } catch (error) {
    return handleMongoDBError(error, res);
  }
};

export default {
  getAccounts,
  getAccountByCurrency
};