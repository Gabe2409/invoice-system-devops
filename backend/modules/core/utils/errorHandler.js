/**
 * @fileoverview Centralized error handling utility for API responses
 * 
 * This module provides standardized error handling functions for API controllers
 * to ensure consistent error responses across the application.
 * 
 * @module utils/errorHandler
 */

/**
 * Standard HTTP error response with optional error details
 * 
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object} [details] - Additional error details
 * @returns {object} Express response with error information
 */
export const sendErrorResponse = (res, statusCode, message, details = null) => {
    const response = {
      success: false,
      message: message || 'An error occurred',
    };
  
    // Add error details if provided
    if (details) {
      response.details = details;
    }
  
    return res.status(statusCode).json(response);
  };
  
  /**
   * Handle common MongoDB errors and provide appropriate responses
   * 
   * @param {Error} error - The caught error object
   * @param {object} res - Express response object
   * @returns {object} Express response with appropriate error information
   */
  export const handleMongoDBError = (error, res) => {
    console.error('MongoDB Error:', error);
  
    // Check for MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      
      // Extract individual validation errors
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return sendErrorResponse(res, 400, 'Validation failed', validationErrors);
    }
    
    // Check for duplicate key errors
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      const message = `Duplicate value for ${duplicateField}`;
      return sendErrorResponse(res, 409, message);
    }
    
    // Check for invalid ID format (CastError)
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return sendErrorResponse(res, 400, 'Invalid ID format');
    }
    
    // Default server error response
    return sendErrorResponse(res, 500, 'Server error', 
      process.env.NODE_ENV !== 'production' ? { message: error.message } : null
    );
  };
  
  /**
   * Handle specific transaction errors and map to appropriate HTTP status codes
   * 
   * @param {Error} error - The caught error object
   * @param {object} res - Express response object
   * @returns {object} Express response with appropriate error information
   */
  export const handleTransactionError = (error, res) => {
    console.error('Transaction Error:', error);
  
    // Map common transaction-related errors to appropriate status codes
    if (error.message.includes('not found')) {
      return sendErrorResponse(res, 404, error.message);
    }
    
    if (error.message.includes('Insufficient')) {
      return sendErrorResponse(res, 422, error.message);
    }
    
    if (error.message.includes('Unauthorized')) {
      return sendErrorResponse(res, 401, error.message);
    }
    
    if (error.message.includes('Invalid')) {
      return sendErrorResponse(res, 400, error.message);
    }
    
    // For other errors, use generic MongoDB error handler
    return handleMongoDBError(error, res);
  };
  
  /**
   * Success response with data payload
   * 
   * @param {object} res - Express response object
   * @param {number} statusCode - HTTP status code (default: 200)
   * @param {string} message - Success message
   * @param {object} data - Response data payload
   * @returns {object} Express response with success information and data
   */
  export const sendSuccessResponse = (res, statusCode = 200, message = 'Success', data = null) => {
    const response = {
      success: true,
      message
    };
    
    // Add data if provided
    if (data) {
      if (typeof data === 'object' && !Array.isArray(data)) {
        // Spread data object properties if it's a plain object
        Object.assign(response, data);
      } else {
        // Otherwise assign to data property
        response.data = data;
      }
    }
    
    return res.status(statusCode).json(response);
  };
  
  export default {
    sendErrorResponse,
    handleMongoDBError,
    handleTransactionError,
    sendSuccessResponse
  };