/**
 * @fileoverview Helper to generate unique transaction references
 * 
 * This module provides a function to generate unique transaction reference IDs
 * with a specified format and validates their uniqueness against the database.
 * 
 * @module helpers/generateUniqueReference
 * @requires mongoose
 */

import Transaction from '../models/transaction.js';

/**
 * Generates a random string of specified length with uppercase letters and numbers
 * 
 * @param {number} length - Length of the string to generate
 * @returns {string} Random alphanumeric string
 */
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a unique transaction reference with format: TX-YYYYMMDD-XXXXX
 * Where YYYYMMDD is the current date and XXXXX is a random alphanumeric string
 * 
 * @async
 * @returns {Promise<string>} Unique reference ID
 * @throws {Error} If unable to generate a unique reference after multiple attempts
 */
async function generateUniqueReference() {
  // Get current date in YYYYMMDD format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Maximum attempts to find a unique reference
  const MAX_ATTEMPTS = 10;
  
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Generate random suffix (5 characters)
    const randomSuffix = generateRandomString(6);
    
    // Combine parts to form reference
    const reference = `TX${dateStr}${randomSuffix}`;
    
    // Check if reference already exists in database
    const exists = await Transaction.exists({ reference });
    
    // If reference is unique, return it
    if (!exists) {
      return reference;
    }
  }
  
  // If we've reached this point, we couldn't generate a unique reference
  throw new Error('Failed to generate unique transaction reference after multiple attempts');
}

export default generateUniqueReference;