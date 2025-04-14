/**
 * @fileoverview Report Configuration Controller - Manages saved report configurations
 *
 * This controller handles CRUD operations for report configurations.
 *
 * @module controllers/reportConfigController
 * @requires mongoose
 * @requires models/reportConfig
 * @requires utils/errorHandler
 */

import mongoose from "mongoose";
import ReportConfig from "../models/reportConfig.js";
import { sendSuccessResponse, sendErrorResponse } from "../../core/utils/errorHandler.js";

/**
 * Create a new report configuration
 *
 * @async
 * @function createReportConfig
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with new report config data or error
 */
export const createReportConfig = async (req, res) => {
  try {
    const { name, type, filters, visualOptions, isScheduled, schedule, isShared } = req.body;

    // Check if name already exists for this user
    const existingConfig = await ReportConfig.findOne({ 
      name, 
      createdBy: req.user._id 
    });

    if (existingConfig) {
      return sendErrorResponse(res, 400, "A report configuration with this name already exists");
    }

    // Create the report configuration
    const reportConfig = await ReportConfig.create({
      name,
      type,
      filters: filters || {},
      visualOptions: visualOptions || {},
      isScheduled: isScheduled || false,
      schedule: schedule || {},
      isShared: isShared || false,
      createdBy: req.user._id
    });

    return sendSuccessResponse(res, 201, "Report configuration created successfully", reportConfig);
  } catch (error) {
    console.error("Error in createReportConfig:", error);
    return sendErrorResponse(res, 500, "Failed to create report configuration");
  }
};

/**
 * Get all report configurations for a user
 *
 * @async
 * @function getReportConfigs
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with report configs or error
 */
export const getReportConfigs = async (req, res) => {
  try {
    const { type } = req.query;

    // Build filter
    const filter = { 
      $or: [
        { createdBy: req.user._id },  // User's own reports
        { isShared: true }            // Shared reports
      ]
    };
    
    // Add type filter if provided
    if (type) {
      filter.type = type;
    }

    // Get report configurations
    const reportConfigs = await ReportConfig.find(filter)
      .sort({ updatedAt: -1 })
      .populate('createdBy', 'userName fullName');

    return sendSuccessResponse(res, 200, "Report configurations retrieved successfully", reportConfigs);
  } catch (error) {
    console.error("Error in getReportConfigs:", error);
    return sendErrorResponse(res, 500, "Failed to retrieve report configurations");
  }
};

/**
 * Get a single report configuration by ID
 *
 * @async
 * @function getReportConfigById
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with report config or error
 */
export const getReportConfigById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendErrorResponse(res, 400, "Invalid report configuration ID format");
    }

    // Get the report configuration
    const reportConfig = await ReportConfig.findById(id)
      .populate('createdBy', 'userName fullName');

    if (!reportConfig) {
      return sendErrorResponse(res, 404, "Report configuration not found");
    }

    // Check access permission
    if (!reportConfig.isShared && reportConfig.createdBy._id.toString() !== req.user._id.toString()) {
      return sendErrorResponse(res, 403, "You don't have permission to access this report configuration");
    }

    return sendSuccessResponse(res, 200, "Report configuration retrieved successfully", reportConfig);
  } catch (error) {
    console.error("Error in getReportConfigById:", error);
    return sendErrorResponse(res, 500, "Failed to retrieve report configuration");
  }
};

/**
 * Update a report configuration
 *
 * @async
 * @function updateReportConfig
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with updated report config or error
 */
export const updateReportConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendErrorResponse(res, 400, "Invalid report configuration ID format");
    }

    // Get the existing report configuration
    const reportConfig = await ReportConfig.findById(id);

    if (!reportConfig) {
      return sendErrorResponse(res, 404, "Report configuration not found");
    }

    // Check if user has permission to update
    if (reportConfig.createdBy.toString() !== req.user._id.toString()) {
      return sendErrorResponse(res, 403, "You don't have permission to update this report configuration");
    }

    // Update the report configuration
    const updatedConfig = await ReportConfig.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'userName fullName');

    return sendSuccessResponse(res, 200, "Report configuration updated successfully", updatedConfig);
  } catch (error) {
    console.error("Error in updateReportConfig:", error);
    return sendErrorResponse(res, 500, "Failed to update report configuration");
  }
};

/**
 * Delete a report configuration
 *
 * @async
 * @function deleteReportConfig
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with deletion status or error
 */
export const deleteReportConfig = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendErrorResponse(res, 400, "Invalid report configuration ID format");
    }

    // Get the report configuration
    const reportConfig = await ReportConfig.findById(id);

    if (!reportConfig) {
      return sendErrorResponse(res, 404, "Report configuration not found");
    }

    // Check if user has permission to delete
    if (reportConfig.createdBy.toString() !== req.user._id.toString()) {
      return sendErrorResponse(res, 403, "You don't have permission to delete this report configuration");
    }

    // Delete the report configuration
    await ReportConfig.findByIdAndDelete(id);

    return sendSuccessResponse(res, 200, "Report configuration deleted successfully", {
      id
    });
  } catch (error) {
    console.error("Error in deleteReportConfig:", error);
    return sendErrorResponse(res, 500, "Failed to delete report configuration");
  }
};

export default {
  createReportConfig,
  getReportConfigs,
  getReportConfigById,
  updateReportConfig,
  deleteReportConfig
};