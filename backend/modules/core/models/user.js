/**
 * @fileoverview User Model - Defines the schema for user accounts
 * 
 * This model represents system users with authentication, roles, and status tracking.
 * It provides methods for password hashing and verification.
 * 
 * @module models/user
 * @requires mongoose
 * @requires bcryptjs
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * User schema definition
 * 
 * @type {mongoose.Schema}
 */
const userSchema = new mongoose.Schema(
  {
    /**
     * Username for login
     * @type {String}
     * @required
     * @unique
     */
    userName: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"]
    },
    
    /**
     * User's full name
     * @type {String}
     * @required
     */
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true
    },
    
    /**
     * User's PIN (hashed)
     * @type {String}
     * @required
     */
    pin: {
      type: String,
      required: [true, "PIN is required"],
      // PIN validation occurs in pre-save hook
    },
    
    /**
     * User's role
     * @type {String}
     * @enum ["staff", "admin"]
     * @default "staff"
     */
    role: {
      type: String,
      enum: {
        values: ["staff", "admin"],
        message: "Role must be either staff or admin"
      },
      default: "staff"
    },
    
    /**
     * Timestamp of last login
     * @type {Date}
     * @default null
     */
    lastLogin: {
      type: Date,
      default: null
    },
    
    /**
     * User account status
     * @type {String}
     * @enum ["active", "inactive", "suspended"]
     * @default "active"
     */
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "suspended"],
        message: "Status must be active, inactive, or suspended"
      },
      default: "active"
    }
  },
  { timestamps: true }
);

/**
 * Pre-save middleware to hash PIN
 * Only hashes the PIN if it has been modified
 */
userSchema.pre("save", async function(next) {
  try {
    // Only validate/hash PIN if it's modified
    if (this.isModified("pin")) {
      // Validate PIN format before hashing (must be 4 digits)
      if (!/^\d{4}$/.test(this.pin) && !this.pin.startsWith('$2b$')) {
        return next(new Error("PIN must be exactly 4 digits"));
      }
      
      // Only hash if not already hashed
      if (!this.pin.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        this.pin = await bcrypt.hash(this.pin, salt);
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to verify PIN
 * 
 * @async
 * @param {string} enteredPin - The PIN to verify
 * @returns {Promise<boolean>} True if PIN matches, false otherwise
 */
userSchema.methods.matchPin = async function(enteredPin) {
  try {
    return await bcrypt.compare(enteredPin, this.pin);
  } catch (error) {
    console.error("PIN comparison error:", error);
    return false;
  }
};

/**
 * Virtual property that indicates if user is an admin
 */
userSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

/**
 * Virtual property to get time since last login
 */
userSchema.virtual('lastLoginDuration').get(function() {
  if (!this.lastLogin) return null;
  return Date.now() - this.lastLogin;
});

// Create needed indexes
userSchema.index({ role: 1, status: 1 });

/**
 * User model
 * @type {mongoose.Model}
 */
const User = mongoose.model("User", userSchema);

export default User;