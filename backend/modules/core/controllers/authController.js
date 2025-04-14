/**
 * @fileoverview Authentication Controller - Manages user authentication operations
 * 
 * This controller handles user authentication, registration, and token management.
 * It provides secure JWT-based authentication with PIN verification.
 * 
 * @module controllers/authController
 * @requires models/user
 * @requires jsonwebtoken
 * @requires utils/errorHandler
 */

import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { sendSuccessResponse, sendErrorResponse, handleMongoDBError } from "../utils/errorHandler.js";

/**
 * Generate a JWT token for authentication
 * 
 * @private
 * @param {string} id - User ID to encode in the token
 * @param {string} [expiresIn="1d"] - Token expiration period
 * @returns {string} Signed JWT token
 */
const generateToken = (id, expiresIn = "1d") => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Authenticate user with username and PIN
 * 
 * @async
 * @function loginUser
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with user data and token or error
 * @description Verifies user credentials and returns authentication token
 */
export const loginUser = async (req, res) => {
  const { userName, pin } = req.body;

  try {
    // Validate required fields
    if (!userName || !pin) {
      return sendErrorResponse(res, 400, "Username and PIN are required");
    }

    // Find user by username
    const user = await User.findOne({ userName });

    if (!user) {
      return sendErrorResponse(res, 401, "Invalid credentials");
    }
    
    // Check user status
    if (user.status === "suspended") {
      return sendErrorResponse(
        res, 
        403, 
        "Account suspended. Please contact an administrator."
      );
    }
    
    if (user.status === "inactive") {
      return sendErrorResponse(
        res, 
        403, 
        "Account inactive. Please contact an administrator to activate your account."
      );
    }

    // Verify PIN
    const isMatch = await user.matchPin(pin);
    if (!isMatch) {
      return sendErrorResponse(res, 401, "Invalid credentials");
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    // Return user data with token
    return sendSuccessResponse(res, 200, "Login successful", {
      _id: user._id,
      userName: user.userName,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      lastLogin: user.lastLogin,
      isAdmin: user.role === "admin",
      token: generateToken(user._id),
    });
  } catch (error) {
    return handleMongoDBError(error, res);
  }
};

/**
 * Register a new user (admin only)
 * 
 * @async
 * @function registerUser
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with new user data or error
 * @description Creates a new user account (requires admin privileges)
 */
export const registerUser = async (req, res) => {
  const { userName, fullName, pin, role, status } = req.body;

  try {
    // Validate required fields
    if (!userName || !fullName || !pin) {
      return sendErrorResponse(res, 400, "Username, full name, and PIN are required");
    }

    // Check PIN format (must be 4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return sendErrorResponse(res, 400, "PIN must be exactly 4 digits");
    }

    // Validate role if provided
    if (role && !["admin", "staff"].includes(role)) {
      return sendErrorResponse(res, 400, "Role must be either 'admin' or 'staff'");
    }

    // Check if username already exists
    const userExists = await User.findOne({ userName });
    if (userExists) {
      return sendErrorResponse(res, 409, "User already exists");
    }

    // Set default status to active if not provided
    const userStatus = status || "active";
    
    // Validate status if provided
    if (status && !["active", "inactive", "suspended"].includes(status)) {
      return sendErrorResponse(res, 400, "Status must be 'active', 'inactive', or 'suspended'");
    }

    // Create new user
    const newUser = await User.create({ 
      userName, 
      fullName, 
      pin, 
      role: role || "staff",
      status: userStatus
    });

    // Return new user data with token
    return sendSuccessResponse(res, 201, "User registered successfully", {
      _id: newUser._id,
      userName: newUser.userName,
      fullName: newUser.fullName,
      role: newUser.role,
      status: newUser.status,
      token: generateToken(newUser._id),
    });
  } catch (error) {
    return handleMongoDBError(error, res);
  }
};

/**
 * Refresh authentication token
 * 
 * @async
 * @function refreshToken
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with new token or error
 * @description Issues a new token for an authenticated user
 */
export const refreshToken = async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return sendErrorResponse(res, 400, "User ID is required");
  }
  
  try {
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }
    
    // Check user status
    if (user.status === "suspended" || user.status === "inactive") {
      return sendErrorResponse(
        res, 
        403, 
        `Account ${user.status}. Cannot refresh token.`
      );
    }
    
    // Generate a new token
    const token = generateToken(user._id);
    
    return sendSuccessResponse(res, 200, "Token refreshed successfully", { 
      token,
      status: user.status
    });
  } catch (error) {
    return handleMongoDBError(error, res);
  }
};

/**
 * Get current user profile
 * 
 * @async
 * @function getUserProfile
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with user profile or error
 * @description Returns the profile for the currently authenticated user
 */
export const getUserProfile = async (req, res) => {
  try {
    // Get user from request (set by auth middleware)
    const user = await User.findById(req.user.id).select("-pin");
    
    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }
    
    return sendSuccessResponse(res, 200, "User profile retrieved successfully", {
      _id: user._id,
      userName: user.userName,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      lastLogin: user.lastLogin,
      isAdmin: user.role === "admin",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    return handleMongoDBError(error, res);
  }
};

export default {
  loginUser,
  registerUser,
  refreshToken,
  getUserProfile
};