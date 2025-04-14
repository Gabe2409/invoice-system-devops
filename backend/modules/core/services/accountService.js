/**
 * @fileoverview Account Service - Manages account balance operations
 * 
 * This service handles currency account operations including balance updates,
 * transaction validation, and account queries. It provides methods for
 * financial operations with data integrity safeguards.
 * 
 * @module services/accountService
 * @requires models/account
 */

import Account from "../models/account.js";

/**
 * Account management service containing functions for account operations
 */
class AccountService {
  /**
   * Update an account balance with validation
   * 
   * @async
   * @param {string} currency - The currency of the account
   * @param {number} amount - The amount to add or subtract
   * @param {boolean} isAdding - Whether to add (true) or subtract (false) the amount
   * @param {mongoose.ClientSession} session - Mongoose transaction session
   * @returns {Promise<Account>} The updated account
   * @throws {Error} If account not found, insufficient balance, or invalid amount
   */
  static async updateAccountBalance(currency, amount, isAdding, session) {
    try {
      // Find the account with session to ensure it's part of the transaction
      const account = await Account.findOne({ currency: currency.toUpperCase() }).session(session);
    
      if (!account) {
        throw new Error(`Account for ${currency} not found`);
      }
    
      // Validate amount is positive
      if (amount <= 0) {
        throw new Error("Transaction amount must be greater than 0");
      }
    
      // Convert both to numbers to ensure they're numeric
      const numericBalance = parseFloat(account.balance);
      const numericAmount = parseFloat(amount);
    
      // Check if either is NaN
      if (isNaN(numericBalance) || isNaN(numericAmount)) {
        throw new Error(`Invalid balance or amount values: Balance=${account.balance}, Amount=${amount}`);
      }
    
      // Check if there's enough balance for withdrawal operations
      if (!isAdding && numericBalance < numericAmount) {
        throw new Error(`Insufficient balance in ${currency} account. Available: ${numericBalance.toFixed(2)}, Requested: ${numericAmount.toFixed(2)}`);
      }
    
      // Calculate new balance
      const newBalance = isAdding
        ? numericBalance + numericAmount
        : numericBalance - numericAmount;
      
      // Update with precision handling (avoiding floating point issues)
      account.balance = parseFloat(newBalance.toFixed(2));
      
      // Save with session
      await account.save({ session });
      
      return account;
    } catch (error) {
      // Re-throw with more context if needed
      if (error.message.includes('not found') || 
          error.message.includes('Insufficient') ||
          error.message.includes('Invalid')) {
        throw error;
      }
      throw new Error(`Error updating ${currency} account balance: ${error.message}`);
    }
  }

  /**
   * Validate account balances before proceeding with transaction
   * 
   * @async
   * @param {string} type - Transaction type (Cash In, Cash Out, Buy, Sell)
   * @param {string} currency - Currency code
   * @param {number} amount - Amount in specified currency
   * @param {number} amountTTD - Equivalent amount in TTD
   * @returns {Promise<void>}
   * @throws {Error} If insufficient balance or account not found
   */
  static async validateAccountBalances(type, currency, amount, amountTTD) {
    try {
      // For Cash Out or Sell, check if there's enough of the specified currency
      if (type === "Cash Out" || type === "Sell") {
        const account = await Account.findOne({ currency: currency.toUpperCase() });

        if (!account) {
          throw new Error(`Account for ${currency} not found`);
        }

        if (account.balance < amount) {
          throw new Error(`Insufficient ${currency} balance. Available: ${account.balance.toFixed(2)}, Requested: ${amount.toFixed(2)}`);
        }
      }

      // For Buy, check if there's enough TTD to exchange
      if (type === "Buy") {
        const ttdAccount = await Account.findOne({ currency: "TTD" });

        if (!ttdAccount) {
          throw new Error("TTD account not found");
        }

        if (ttdAccount.balance < amountTTD) {
          throw new Error(`Insufficient TTD balance to buy currency. Available: ${ttdAccount.balance.toFixed(2)}, Requested: ${amountTTD.toFixed(2)}`);
        }
      }
    } catch (error) {
      // Re-throw with more context if needed
      throw error;
    }
  }

  /**
   * Process account updates based on transaction type
   * 
   * @async
   * @param {string} type - Transaction type (Cash In, Cash Out, Buy, Sell)
   * @param {string} currency - Currency code
   * @param {number} amount - Amount in specified currency
   * @param {number} amountTTD - Equivalent amount in TTD
   * @param {mongoose.ClientSession} session - Mongoose transaction session
   * @returns {Promise<void>}
   * @throws {Error} If invalid transaction type or account operation fails
   */
  static async processAccountUpdates(type, currency, amount, amountTTD, session) {
    try {
      // Standardize currency code
      const formattedCurrency = currency.toUpperCase();
      
      switch (type) {
        case "Cash In":
          // Add money to currency account
          await this.updateAccountBalance(formattedCurrency, amount, true, session);
          break;
          
        case "Cash Out":
          // Remove money from currency account
          await this.updateAccountBalance(formattedCurrency, amount, false, session);
          break;
          
        case "Buy":
          // Remove TTD, add foreign currency
          await this.updateAccountBalance("TTD", amountTTD, false, session);
          await this.updateAccountBalance(formattedCurrency, amount, true, session);
          break;
          
        case "Sell":
          // Remove foreign currency, add TTD
          await this.updateAccountBalance(formattedCurrency, amount, false, session);
          await this.updateAccountBalance("TTD", amountTTD, true, session);
          break;
          
        default:
          throw new Error(`Invalid transaction type: ${type}`);
      }
    } catch (error) {
      // Re-throw with more context if needed
      throw error;
    }
  }

  /**
   * Reverses account updates for a transaction (for deletion or cancellation)
   * 
   * @async
   * @param {string} type - Transaction type (Cash In, Cash Out, Buy, Sell)
   * @param {string} currency - Currency code
   * @param {number} amount - Amount in specified currency
   * @param {number} amountTTD - Equivalent amount in TTD
   * @param {mongoose.ClientSession} session - Mongoose transaction session
   * @returns {Promise<void>}
   * @throws {Error} If invalid transaction type or account operation fails
   */
  static async reverseAccountUpdates(type, currency, amount, amountTTD, session) {
    try {
      // Standardize currency code
      const formattedCurrency = currency.toUpperCase();
      
      switch (type) {
        case "Cash In":
          // Reverse Cash In: Remove money from currency account
          await this.updateAccountBalance(formattedCurrency, amount, false, session);
          break;
          
        case "Cash Out":
          // Reverse Cash Out: Add money to currency account
          await this.updateAccountBalance(formattedCurrency, amount, true, session);
          break;
          
        case "Buy":
          // Reverse Buy: Add TTD back, remove foreign currency
          await this.updateAccountBalance("TTD", amountTTD, true, session);
          await this.updateAccountBalance(formattedCurrency, amount, false, session);
          break;
          
        case "Sell":
          // Reverse Sell: Add foreign currency back, remove TTD
          await this.updateAccountBalance(formattedCurrency, amount, true, session);
          await this.updateAccountBalance("TTD", amountTTD, false, session);
          break;
          
        default:
          throw new Error(`Cannot reverse transaction of type: ${type}`);
      }
    } catch (error) {
      // Re-throw with more context if needed
      throw error;
    }
  }

  /**
   * Gets all account balances
   * 
   * @async
   * @returns {Promise<Array<Account>>} Array of accounts with balances
   */
  static async getAllAccountBalances() {
    try {
      return await Account.find({}).select('currency balance').sort({ currency: 1 });
    } catch (error) {
      throw new Error(`Error fetching account balances: ${error.message}`);
    }
  }

  /**
   * Gets a specific account by currency
   * 
   * @async
   * @param {string} currency - Currency code
   * @returns {Promise<Account>} The account
   * @throws {Error} If account not found
   */
  static async getAccount(currency) {
    try {
      const account = await Account.findOne({ currency: currency.toUpperCase() });
      if (!account) {
        throw new Error(`Account for ${currency} not found`);
      }
      return account;
    } catch (error) {
      // Re-throw with more context if needed
      throw error;
    }
  }
  
  /**
   * Create a new account if it doesn't exist
   * 
   * @async
   * @param {string} currency - Currency code
   * @param {number} [initialBalance=0] - Initial account balance
   * @returns {Promise<Account>} The created or existing account
   */
  static async createAccount(currency, initialBalance = 0) {
    try {
      const formattedCurrency = currency.toUpperCase();
      
      // Check if account already exists
      let account = await Account.findOne({ currency: formattedCurrency });
      
      // If not, create it
      if (!account) {
        account = await Account.create({
          currency: formattedCurrency,
          balance: initialBalance
        });
      }
      
      return account;
    } catch (error) {
      throw new Error(`Error creating account for ${currency}: ${error.message}`);
    }
  }
}

export default AccountService;