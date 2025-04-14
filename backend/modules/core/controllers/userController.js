/**
 * @fileoverview User Controller - Manages user accounts
 *
 * This controller handles operations related to user management including
 * retrieving, creating, updating, and deleting user accounts.
 *
 * @module controllers/userController
 * @requires mongoose
 * @requires models/user
 * @requires utils/errorHandler
 */

import mongoose from "mongoose";
import User from "../models/user.js";
import {
  sendSuccessResponse,
  sendErrorResponse,
  handleMongoDBError,
} from "../utils/errorHandler.js";

/**
 * Get all users with pagination, sorting, and filtering
 *
 * @async
 * @function getUsers
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with users and pagination info or error
 * @description Returns users with comprehensive filtering, sorting, and pagination options
 */
export const getUsers = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting (default to createdAt descending)
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "-1";
    const sort = { [sortBy]: parseInt(sortOrder) };

    // Filtering
    const filter = {};

    // Text search (search by username or full name)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      filter.$or = [{ userName: searchRegex }, { fullName: searchRegex }];
    }

    // Role filter
    if (req.query.role) {
      filter.role = req.query.role;
    }

    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Date range filters
    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {};

      if (req.query.dateFrom) {
        filter.createdAt.$gte = new Date(req.query.dateFrom);
      }

      if (req.query.dateTo) {
        // Add one day to include the entire day
        const dateTo = new Date(req.query.dateTo);
        dateTo.setDate(dateTo.getDate() + 1);
        filter.createdAt.$lte = dateTo;
      }
    }

    // Last login filters
    if (req.query.lastLoginFrom || req.query.lastLoginTo) {
      filter.lastLogin = {};

      if (req.query.lastLoginFrom) {
        filter.lastLogin.$gte = new Date(req.query.lastLoginFrom);
      }

      if (req.query.lastLoginTo) {
        // Add one day to include the entire day
        const lastLoginTo = new Date(req.query.lastLoginTo);
        lastLoginTo.setDate(lastLoginTo.getDate() + 1);
        filter.lastLogin.$lte = lastLoginTo;
      }
    }

    // Execute query
    const users = await User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-pin"); // Exclude sensitive PIN field

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Return users with pagination metadata
    return sendSuccessResponse(res, 200, "Users retrieved successfully", {
      users,
      pagination: {
        total: totalUsers,
        totalPages,
        currentPage: page,
        limit,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    return handleMongoDBError(error, res);
  }
};

/**
 * Get a single user by ID
 *
 * @async
 * @function getUserById
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with user data or error
 * @description Returns detailed information for a specific user
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendErrorResponse(res, 400, "Invalid user ID");
    }

    const user = await User.findById(id).select("-pin");

    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    return sendSuccessResponse(res, 200, "User retrieved successfully", {
      user,
    });
  } catch (error) {
    return handleMongoDBError(error, res);
  }
};

/**
 * Update a user
 *
 * @async
 * @function updateUser
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with updated user data or error
 * @description Updates a user's details (fullName, role, status)
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, role, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendErrorResponse(res, 400, "Invalid user ID");
    }

    // Validate required fields
    if (!fullName || !role) {
      return sendErrorResponse(res, 400, "Full name and role are required");
    }

    // Validate role
    if (!["admin", "staff"].includes(role)) {
      return sendErrorResponse(res, 400, "Invalid role");
    }

    // Validate status if provided
    if (status && !["active", "inactive", "suspended"].includes(status)) {
      return sendErrorResponse(res, 400, "Invalid status");
    }

    // Find user and update
    const user = await User.findById(id);

    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    // Update fields
    user.fullName = fullName;
    user.role = role;

    // Update status if provided
    if (status) {
      user.status = status;
    }

    // Save user
    const updatedUser = await user.save();

    // Return updated user without PIN
    return sendSuccessResponse(res, 200, "User updated successfully", {
      user: {
        _id: updatedUser._id,
        userName: updatedUser.userName,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        status: updatedUser.status,
        lastLogin: updatedUser.lastLogin,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    return handleMongoDBError(error, res);
  }
};

/**
 * Update own profile information
 *
 * @async
 * @function updateProfile
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with updated profile data or error
 * @description Allows a user to update their own profile (fullName, userName, PIN)
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, userName, currentPin, newPin } = req.body;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    // Update basic profile info
    if (fullName) {
      user.fullName = fullName;
    }
    
    if (userName) {
      // Check if the username is already taken by another user
      const existingUser = await User.findOne({ userName, _id: { $ne: userId } });
      if (existingUser) {
        return sendErrorResponse(res, 400, "Username is already taken");
      }
      user.userName = userName;
    }

    // Update PIN if requested
    if (currentPin && newPin) {
      // Verify current PIN using the matchPin method from the user model
      const isCorrectPin = await user.matchPin(currentPin);
      
      if (!isCorrectPin) {
        return sendErrorResponse(res, 401, "Current PIN is incorrect");
      }

      // Validate new PIN
      if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
        return sendErrorResponse(res, 400, "PIN must be exactly 4 digits");
      }

      // Set the new PIN (will be hashed in the pre-save hook)
      user.pin = newPin;
    }

    // Save user
    await user.save();

    // Return updated user data without PIN
    const userData = {
      _id: user._id,
      userName: user.userName,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      token: req.token, // Include the original token if available
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return sendSuccessResponse(res, 200, "Profile updated successfully", {
      user: userData
    });
  } catch (error) {
    return handleMongoDBError(error, res);
  }
};

/**
 * Update user status
 *
 * @async
 * @function updateUserStatus
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with updated status or error
 * @description Updates a user's status (active, inactive, suspended)
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendErrorResponse(res, 400, "Invalid user ID");
    }

    // Validate status
    if (!status || !["active", "inactive", "suspended"].includes(status)) {
      return sendErrorResponse(res, 400, "Valid status is required");
    }

    const user = await User.findById(id);

    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    // Update status
    user.status = status;
    await user.save();

    return sendSuccessResponse(res, 200, `User status updated to ${status}`, {
      user: {
        _id: user._id,
        userName: user.userName,
        status: user.status,
      },
    });
  } catch (error) {
    return handleMongoDBError(error, res);
  }
};

/**
 * Delete a user
 *
 * @async
 * @function deleteUser
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with deletion status or error
 * @description Deletes a user account from the system
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendErrorResponse(res, 400, "Invalid user ID");
    }

    const user = await User.findById(id);

    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    // Check if user is trying to delete themselves
    if (req.user._id.toString() === id) {
      return sendErrorResponse(res, 400, "You cannot delete your own account");
    }

    // Delete user (using deleteOne instead of deprecated remove)
    await User.deleteOne({ _id: id });

    return sendSuccessResponse(res, 200, "User deleted successfully");
  } catch (error) {
    return handleMongoDBError(error, res);
  }
};

/**
 * Reset a user's PIN
 *
 * @async
 * @function resetUserPin
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with reset confirmation or error
 * @description Resets a user's PIN to a new value
 */
export const resetUserPin = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPin } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendErrorResponse(res, 400, "Invalid user ID");
    }

    // Validate PIN
    if (!newPin || newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      return sendErrorResponse(res, 400, "PIN must be exactly 4 digits");
    }

    // Find user
    const user = await User.findById(id);

    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    // Update PIN
    user.pin = newPin;

    // Save user
    await user.save();

    return sendSuccessResponse(res, 200, "PIN reset successfully");
  } catch (error) {
    return handleMongoDBError(error, res);
  }
};

export default {
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  resetUserPin,
  updateProfile
};