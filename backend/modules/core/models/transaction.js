/**
 * @fileoverview Transaction Model - Defines the schema for financial transactions
 * 
 * This model represents financial transactions in the system, including
 * cash operations and currency exchanges. It tracks transaction details,
 * customer information, and financial data.
 * 
 * @module models/transaction
 * @requires mongoose
 */

import mongoose from "mongoose";

/**
 * Transaction schema definition
 * 
 * @type {mongoose.Schema}
 */
const transactionSchema = new mongoose.Schema(
  {
    /**
     * Unique transaction reference ID
     * @type {String}
     * @unique
     */
    reference: {
      type: String,
      unique: true,
      required: [true, "Transaction reference is required"],
      trim: true
    },
    
    /**
     * Customer's name
     * @type {String}
     * @required
     */
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true
    },
    
    /**
     * Customer's email address for receipts
     * @type {String}
     * @required
     */
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: props => `${props.value} is not a valid email address`
      }
    },
    
    /**
     * Transaction type
     * @type {String}
     * @enum ["Cash In", "Cash Out", "Buy", "Sell"]
     * @required
     */
    type: {
      type: String,
      enum: {
        values: ["Cash In", "Cash Out", "Buy", "Sell"],
        message: "Transaction type must be Cash In, Cash Out, Buy, or Sell"
      },
      required: [true, "Transaction type is required"]
    },
    
    /**
     * Transaction amount in the specified currency
     * @type {Number}
     * @required
     */
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"]
    },
    
    /**
     * Currency code for the transaction
     * @type {String}
     * @required
     */
    currency: {
      type: String,
      required: [true, "Currency is required"],
      trim: true,
      uppercase: true
    },
    
    /**
     * Exchange rate used for Buy/Sell transactions
     * @type {Number}
     * @default 0
     */
    exchangeRate: {
      type: Number,
      default: 0,
      min: [0, "Exchange rate cannot be negative"]
    },
    
    /**
     * Equivalent amount in TTD (Trinidad and Tobago Dollar)
     * Used for currency conversion transactions
     * @type {Number}
     * @default 0
     */
    amountTTD: {
      type: Number,
      default: 0,
      min: [0, "TTD amount cannot be negative"]
    },
    
    /**
     * Transaction status
     * @type {String}
     * @enum ["Pending", "Completed", "Cancelled", "Refunded"]
     * @default "Completed"
     */
    status: {
      type: String,
      enum: {
        values: ["Pending", "Completed", "Cancelled", "Refunded"],
        message: "Status must be Pending, Completed, Cancelled, or Refunded"
      },
      default: "Completed"
    },
    
    /**
     * Additional notes about the transaction
     * @type {String}
     * @default ""
     */
    notes: {
      type: String,
      default: "",
      trim: true
    },
    
    /**
     * Customer's signature (Base64-encoded)
     * @type {String}
     * @default ""
     */
    customerSignature: {
      type: String,
      default: ""
    },
    
    /**
     * Reference to the user who created the transaction
     * @type {mongoose.Schema.Types.ObjectId}
     * @ref "User"
     * @required
     */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"]
    }
  },
  { 
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        // Format monetary values to 2 decimal places
        if (ret.amount) {
          ret.amount = parseFloat(ret.amount.toFixed(2));
        }
        if (ret.amountTTD) {
          ret.amountTTD = parseFloat(ret.amountTTD.toFixed(2));
        }
        if (ret.exchangeRate) {
          ret.exchangeRate = parseFloat(ret.exchangeRate.toFixed(4));
        }
        return ret;
      }
    }
  }
);

// Create needed indexes
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ currency: 1, type: 1 });
transactionSchema.index({ createdBy: 1 });
transactionSchema.index({ customerName: 'text', customerEmail: 'text', reference: 'text' });

/**
 * Virtual property for transaction age in days
 */
transactionSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

/**
 * Transaction model
 * @type {mongoose.Model}
 */
const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;