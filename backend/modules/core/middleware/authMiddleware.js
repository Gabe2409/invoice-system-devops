/**
 * @fileoverview Authentication Middleware - Secures API routes
 * 
 * This middleware provides JWT-based authentication and role-based
 * authorization for API routes.
 * 
 * @module middleware/authMiddleware
 * @requires jsonwebtoken
 * @requires models/user
 * @requires utils/errorHandler
 */

import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { sendErrorResponse } from "../utils/errorHandler.js";

/**
 * Protects routes by verifying JWT authentication
 * 
 * @function protect
 * @async
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {function} Calls next middleware if authenticated, otherwise returns error response
 * @description Verifies JWT token from Authorization header and attaches user to request
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Authorization header with Bearer token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Extract token from header
      token = req.headers.authorization.split(" ")[1];
      
      if (!token) {
        return sendErrorResponse(res, 401, "No token provided");
      }

      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database (exclude PIN)
        const user = await User.findById(decoded.id).select("-pin");
        
        if (!user) {
          return sendErrorResponse(res, 401, "User not found");
        }
        
        if (user.status !== "active") {
          return sendErrorResponse(res, 403, `Account ${user.status}. Access denied.`);
        }
        
        // Attach user to request object
        req.user = user;
        next();
      } catch (error) {
        // Handle specific JWT errors
        if (error.name === "TokenExpiredError") {
          return sendErrorResponse(res, 401, "Session expired", { expired: true });
        }
        if (error.name === "JsonWebTokenError") {
          return sendErrorResponse(res, 401, "Invalid token");
        }
        throw error; // Re-throw unexpected errors
      }
    } else {
      return sendErrorResponse(res, 401, "Unauthorized, no token");
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return sendErrorResponse(res, 500, "Authentication error");
  }
};

/**
 * Restricts routes to admin users only
 * 
 * @function adminOnly
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {function} Calls next middleware if admin, otherwise returns error response
 * @description Verifies the user has admin role (requires auth middleware to run first)
 */
export const adminOnly = (req, res, next) => {
  // Check if user exists and is an admin
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return sendErrorResponse(res, 403, "Admin access required");
  }
};

export default {
  protect,
  adminOnly
};