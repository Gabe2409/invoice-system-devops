/**
 * @fileoverview Settings Controller - Manages application settings
 * 
 * This controller handles CRUD operations for application settings,
 * including user-specific preferences and system-wide configurations.
 * 
 * @module controllers/settingController
 * @requires models/settings
 * @requires services/settingsService
 * @requires utils/errorHandler
 */

import Settings from "../models/settings.js";
import SettingsService from "../services/settingsService.js";
import { sendSuccessResponse, sendErrorResponse, handleMongoDBError } from "../utils/errorHandler.js";

/**
 * Get application settings structured by category
 * 
 * @async
 * @function getAppSettings
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with categorized settings or error
 * @description Returns settings organized by category with user-specific settings if authenticated
 */
export const getAppSettings = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === "admin";
    const userId = req.user?._id;
    
    // Get application settings
    const appSettings = await SettingsService.getAppSettings(isAdmin);
    
    // Add user-specific settings if user is authenticated
    if (userId) {
      // Get user-specific settings
      const userSettings = await SettingsService.getUserSettingsForCategory(
        SettingsService.CATEGORIES.USER,
        userId
      );
      
      // Add them to the response
      appSettings.user = userSettings;
    }
    
    return sendSuccessResponse(res, 200, "Application settings retrieved successfully", appSettings);
  } catch (error) {
    return handleMongoDBError(error, res);
  }
};

/**
 * Get all settings based on user access level
 * 
 * @async
 * @function getSettings
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with accessible settings or error
 * @description Returns all settings the user has access to (public settings for everyone,
 *              user-specific settings for authenticated users, all settings for admins)
 */
export const getSettings = async (req, res) => {
  try {
    let query = {};
    const isAdmin = req.user && req.user.role === "admin";
    const userId = req.user?._id;
    
    // Build query based on user access level
    if (!req.user) {
      // Public access - only return public settings
      query.isPublic = true;
    } 
    else if (!isAdmin && userId) {
      // Regular user - return public settings and their own settings
      query.$or = [
        { isPublic: true },
        { key: { $regex: `_${userId}$` } }  // Settings specific to this user
      ];
    }
    // Admin users see all settings (no query restriction)
    
    // Execute query
    const settings = await Settings.find(query).select('-__v');
    
    // Convert to a more usable format for frontend
    const formattedSettings = {};
    settings.forEach(setting => {
      // For user settings, strip the user ID from the key in the response
      let responseKey = setting.key;
      if (userId && responseKey.includes(`_${userId}`)) {
        // Replace user-specific suffix with a generic key for client-side use
        responseKey = responseKey.replace(`_${userId}`, '');
      }
      formattedSettings[responseKey] = setting.value;
    });
    
    return sendSuccessResponse(res, 200, "Settings retrieved successfully", { settings: formattedSettings });
  } catch (error) {
    return handleMongoDBError(error, res);
  }
};

/**
 * Get a single setting by key
 * 
 * @async
 * @function getSettingByKey
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with setting value or error
 * @description Returns a specific setting if the user has access to it
 */
export const getSettingByKey = async (req, res) => {
  try {
    let { key } = req.params;
    const isAdmin = req.user && req.user.role === "admin";
    const userId = req.user?._id;
    
    if (!key) {
      return sendErrorResponse(res, 400, "Setting key is required");
    }
    
    // Handle user-specific settings
    let settingKey = key;
    if (key.startsWith('user_') && userId) {
      // For user settings, check if this is a user-specific request
      // If so, append the user ID to make it user-specific
      if (!key.includes(`_${userId}`)) {
        settingKey = `${key}_${userId}`;
      }
    }
    
    // Try to find the setting
    let setting = await Settings.findOne({ key: settingKey });
    
    // If no user-specific setting found, try to get the global default
    // (only for user settings)
    if (!setting && key.startsWith('user_') && settingKey !== key) {
      setting = await Settings.findOne({ key });
    }
    
    if (!setting) {
      return sendErrorResponse(res, 404, "Setting not found");
    }
    
    // Check if user has access to this setting
    if (!setting.isPublic && (!req.user || !isAdmin)) {
      return sendErrorResponse(res, 403, "Access denied");
    }
    
    return sendSuccessResponse(res, 200, "Setting retrieved successfully", { 
      key: key, 
      value: setting.value 
    });
  } catch (error) {
    return handleMongoDBError(error, res);
  }
};

/**
 * Create or update a setting
 * 
 * @async
 * @function upsertSetting
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with updated setting or error
 * @description Creates or updates a setting based on access level:
 *              - Admins can modify any setting
 *              - Regular users can only modify their own user settings
 */
export const upsertSetting = async (req, res) => {
  try {
    const { key, value, description, isPublic, category, name } = req.body;
    const isAdmin = req.user && (req.user.role === "admin" || req.user.isAdmin);
    const userId = req.user?._id || req.user?.id;
    
    // console.log('DEBUG - upsertSetting controller:');
    // console.log('Request body:', { category, name, value });
    // console.log('User ID from request:', userId);
    // console.log('Is admin:', isAdmin);
    
    // Handle categorized creation (using SettingsService)
    if (category && name) {
      // Check authorization for non-user settings
      if (!isAdmin && category !== 'user') {
        return res.status(403).json({ message: "Only admins can modify non-user settings" });
      }
      
      // MODIFIED: Always use user ID for 'user' category settings, even for admins 
      // This ensures every user gets their own settings
      let settingUserId = null;
      
      if (category === 'user' && userId) {
        // Always use user ID for user settings, regardless of admin status
        settingUserId = userId;
        // console.log('ALWAYS using user ID for user settings:', settingUserId);
      }
      
      // Create or update categorized setting
      const setting = await SettingsService.upsertCategorizedSetting(
        category,
        name,
        value,
        description,
        isPublic !== undefined ? isPublic : true,
        settingUserId // Pass the user ID always for user settings
      );
      
      // console.log('Setting saved with key:', setting.key);
      
      return res.status(200).json({ 
        success: true,
        message: "Setting saved successfully", 
        data: { setting } 
      });
    }
    
    // Handle direct key access (for backward compatibility)
    if (!key || value === undefined) {
      return res.status(400).json({ message: "Key/name and value are required" });
    }
    
    // Check if this is a user-specific setting
    const isUserSetting = key.startsWith('user_');
    
    // MODIFIED: For user settings, always append userId, even for admins
    let finalKey = key;
    if (isUserSetting && userId) {
      // Extract the base key without any user ID
      const baseKey = key.includes('_') ? key.split('_').slice(0, -1).join('_') : key;
      
      // Always append the current user's ID
      finalKey = `${baseKey}_${userId}`;
      // console.log('ALWAYS using user-specific key:', finalKey);
    }
    
    // Use findOneAndUpdate with upsert option to create if not exists
    const setting = await Settings.findOneAndUpdate(
      { key: finalKey },
      { 
        key: finalKey,
        value,
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic })
      },
      { 
        new: true,
        upsert: true,
        runValidators: true
      }
    );
    
    // console.log('Direct setting saved with key:', setting.key);
    
    // Return the original key (without user ID) in the response for consistency
    return res.status(200).json({
      success: true,
      message: "Setting saved successfully",
      data: {
        ...setting.toObject(),
        key: key // Use the original key in the response
      }
    });
  } catch (error) {
    console.error('Error in upsertSetting:', error);
    return res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};
/**
 * Delete a setting
 * 
 * @async
 * @function deleteSetting
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with deletion status or error
 * @description Deletes a setting (admin only)
 */
export const deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const isAdmin = req.user && req.user.role === "admin";
    
    if (!key) {
      return sendErrorResponse(res, 400, "Setting key is required");
    }
    
    // Verify admin access
    if (!req.user || !isAdmin) {
      return sendErrorResponse(res, 403, "Not authorized to delete settings");
    }
    
    // Delete the setting
    const setting = await Settings.findOneAndDelete({ key });
    
    if (!setting) {
      return sendErrorResponse(res, 404, "Setting not found");
    }
    
    return sendSuccessResponse(res, 200, "Setting deleted successfully");
  } catch (error) {
    return handleMongoDBError(error, res);
  }
};

/**
 * Get all settings with full details
 * 
 * @async
 * @function getSettingsWithDetails
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with detailed settings or error
 * @description Returns all settings with complete details (admin only)
 */
export const getSettingsWithDetails = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === "admin";
    
    // Verify admin access
    if (!isAdmin) {
      return sendErrorResponse(res, 403, "Admin access required");
    }
    
    const settings = await Settings.find().select('-__v');
    return sendSuccessResponse(res, 200, "Settings retrieved successfully", { settings });
  } catch (error) {
    return handleMongoDBError(error, res);
  }
};

export default {
  getAppSettings,
  getSettings,
  getSettingByKey,
  upsertSetting,
  deleteSetting,
  getSettingsWithDetails
};