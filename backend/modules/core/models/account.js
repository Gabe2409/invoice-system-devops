/**
 * @fileoverview Account Model - Defines the schema for currency accounts
 * 
 * This model represents individual currency accounts in the system,
 * each with its own balance. It tracks currency types and their balances.
 * 
 * @module models/account
 * @requires mongoose
 */

import mongoose from "mongoose";

/**
 * Account schema definition
 * 
 * @type {mongoose.Schema}
 */
const accountSchema = new mongoose.Schema(
  {
    /**
     * The currency code for this account (e.g., USD, EUR, TTD)
     * @type {String}
     * @required
     * @unique
     */
    currency: {
      type: String,
      required: [true, "Currency is required"],
      unique: true,
      trim: true,
      uppercase: true
    },
    
    /**
     * The current balance for this currency
     * @type {Number}
     * @required
     * @default 0
     */
    balance: {
      type: Number,
      required: [true, "Balance is required"],
      default: 0,
      min: [0, "Balance cannot be negative"] // Prevents negative balance
    }
  },
  { 
    timestamps: true,
    toJSON: { 
      virtuals: true,
      /**
       * Transform the document during conversion to JSON
       * Formats balance to 2 decimal places
       */
      transform: function(doc, ret) {
        // Format balance to 2 decimal places on JSON conversion
        if (ret.balance) {
          ret.balance = parseFloat(ret.balance.toFixed(2));
        }
        return ret;
      }
    }
  }
);

/**
 * Account model
 * @type {mongoose.Model}
 */
const Account = mongoose.model("Account", accountSchema);

export default Account;