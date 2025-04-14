/**
 * @fileoverview Settings Service - Manages application configuration
 * 
 * This service provides methods to manage application settings, including
 * user preferences, system configuration, and feature flags.
 * 
 * @module services/settingsService
 * @requires models/settings
 */

import Settings from "../models/settings.js";

/**
 * Settings service for managing application configuration
 */
class SettingsService {
  /**
   * Setting categories
   * @readonly
   * @enum {string}
   */
  static CATEGORIES = {
    /** Application-wide settings (app name, maintenance mode) */
    SYSTEM: 'system',
    /** User-specific settings (theme preferences) */
    USER: 'user',
    /** Feature flags */
    FEATURE: 'feature',
    /** Configuration values (API limits, etc) */
    CONFIG: 'config'
  };

  /**
   * Get settings by category and access level
   * 
   * @async
   * @param {string} category - Category of settings to fetch
   * @param {boolean} [adminAccess=false] - Whether to include private settings
   * @param {string} [userId=null] - User ID for user-specific settings
   * @returns {Promise<Object>} Object with settings as key-value pairs
   * @throws {Error} If category is invalid or database operation fails
   */
  static async getSettingsByCategory(category, adminAccess = false, userId = null) {
    try {
      // Validate category
      if (!Object.values(this.CATEGORIES).includes(category)) {
        throw new Error(`Invalid category: ${category}`);
      }
      
      // Build query based on category and access level
      let query = {};
      
      // For user settings, filter by user ID if provided
      if (category === this.CATEGORIES.USER && userId) {
        query = { key: { $regex: `^${category}_.*_${userId}$` } };
      } else {
        query = { key: { $regex: `^${category}_` } };
      }
      
      // Add access level check
      if (!adminAccess) {
        query.isPublic = true;
      }
      
      const settings = await Settings.find(query);
      
      // Transform to key-value object, removing category prefix for cleaner usage
      const settingsObject = {};
      settings.forEach(setting => {
        // Remove category prefix and user ID suffix for cleaner keys
        let displayKey = setting.key
          .replace(`${category}_`, '');
          
        if (userId && displayKey.endsWith(`_${userId}`)) {
          displayKey = displayKey.replace(`_${userId}`, '');
        }
          
        settingsObject[displayKey] = setting.value;
      });
      
      return settingsObject;
    } catch (error) {
      throw new Error(`Error fetching settings for category ${category}: ${error.message}`);
    }
  }

  /**
   * Get user-specific settings for a category
   * 
   * @async
   * @param {string} category - Settings category
   * @param {string} userId - The user's ID
   * @returns {Promise<Object>} User's settings for that category
   * @throws {Error} If category is invalid or database operation fails
   */
  static async getUserSettingsForCategory(category, userId) {
    try {
      if (!userId) return {};
      
      // Validate category
      if (!Object.values(this.CATEGORIES).includes(category)) {
        throw new Error(`Invalid category: ${category}`);
      }
      
      // Find all settings for this category and user
      const query = {
        key: { $regex: `^${category}_.*_${userId}$` }
      };
      
      const settings = await Settings.find(query);
      
      // Transform to key-value object with clean keys
      const settingsObject = {};
      settings.forEach(setting => {
        // Extract the base setting name without category and user ID
        let baseName = setting.key
          .replace(`${category}_`, '')
          .replace(`_${userId}`, '');
          
        settingsObject[baseName] = setting.value;
      });
      
      return settingsObject;
    } catch (error) {
      throw new Error(`Error fetching user settings for category ${category}: ${error.message}`);
    }
  }

  /**
   * Get all application settings (system, feature, config)
   * 
   * @async
   * @param {boolean} [adminAccess=false] - Whether to include private settings
   * @returns {Promise<Object>} Object with all app settings
   * @throws {Error} If database operation fails
   */
  static async getAppSettings(adminAccess = false) {
    try {
      // Get settings from each relevant category
      const systemSettings = await this.getSettingsByCategory(this.CATEGORIES.SYSTEM, adminAccess);
      const featureSettings = await this.getSettingsByCategory(this.CATEGORIES.FEATURE, adminAccess);
      const configSettings = await this.getSettingsByCategory(this.CATEGORIES.CONFIG, adminAccess);
      
      // Combine into a structured object
      return {
        system: systemSettings,
        features: featureSettings,
        config: configSettings,
        user: {} // Empty user object, will be populated with specific user settings elsewhere
      };
    } catch (error) {
      throw new Error(`Error fetching application settings: ${error.message}`);
    }
  }

  /**
   * Get user-specific settings
   * 
   * @async
   * @param {string} userId - The user's ID
   * @returns {Promise<Object>} User's settings
   * @throws {Error} If database operation fails
   */
  static async getUserSettings(userId) {
    try {
      if (!userId) return {};
      return await this.getSettingsByCategory(this.CATEGORIES.USER, true, userId);
    } catch (error) {
      throw new Error(`Error fetching user settings: ${error.message}`);
    }
  }

  /**
   * Get all settings, optionally filtering by public/private
   * 
   * @async
   * @param {boolean} [adminAccess=false] - Whether to include private settings
   * @param {string} [userId=null] - Optional user ID for including user settings
   * @returns {Promise<Object>} Object with settings as key-value pairs
   * @throws {Error} If database operation fails
   */
  static async getAllSettings(adminAccess = false, userId = null) {
    try {
      const query = adminAccess ? {} : { isPublic: true };
      
      // Include user-specific settings if userId provided
      if (userId && !adminAccess) {
        query.$or = [
          { isPublic: true },
          { key: { $regex: `_${userId}$` } }
        ];
      }
      
      const settings = await Settings.find(query);
      
      // Transform to key-value object for easier consumption
      const settingsObject = {};
      settings.forEach(setting => {
        // For user-specific settings, normalize the key
        let displayKey = setting.key;
        if (userId && setting.key.endsWith(`_${userId}`)) {
          displayKey = setting.key.replace(`_${userId}`, '');
        }
        settingsObject[displayKey] = setting.value;
      });
      
      return settingsObject;
    } catch (error) {
      throw new Error(`Error fetching all settings: ${error.message}`);
    }
  }

  /**
   * Get a single setting by key
   * 
   * @async
   * @param {string} key - The setting key
   * @param {boolean} [adminAccess=false] - Whether private settings can be accessed
   * @param {string} [userId=null] - Optional user ID for user-specific settings
   * @returns {Promise<any>} The setting value
   * @throws {Error} If setting not found, access denied, or database operation fails
   */
  static async getSetting(key, adminAccess = false, userId = null) {
    try {
      // For user settings, try user-specific key first
      let setting = null;
      
      if (userId && key.startsWith(`${this.CATEGORIES.USER}_`)) {
        const userKey = key.endsWith(`_${userId}`) ? key : `${key}_${userId}`;
        setting = await Settings.findOne({ key: userKey });
      }
      
      // If no user-specific setting found or not a user setting, use the original key
      if (!setting) {
        setting = await Settings.findOne({ key });
      }
      
      if (!setting) {
        throw new Error(`Setting '${key}' not found`);
      }
      
      // Check access permissions
      if (!setting.isPublic && !adminAccess) {
        throw new Error(`Access denied to setting '${key}'`);
      }
      
      return setting.value;
    } catch (error) {
      // Rethrow access denied and not found errors
      if (error.message.includes('not found') || error.message.includes('Access denied')) {
        throw error;
      }
      throw new Error(`Error fetching setting '${key}': ${error.message}`);
    }
  }

  /**
   * Create or update a setting with categorization
   * 
   * @async
   * @param {string} category - Setting category
   * @param {string} name - Setting name
   * @param {any} value - Setting value
   * @param {string} [description] - Optional description
   * @param {boolean} [isPublic=true] - Whether the setting is publicly accessible
   * @param {string} [userId=null] - User ID for user-specific settings
   * @returns {Promise<Settings>} The created/updated setting
   * @throws {Error} If category is invalid or database operation fails
   */
static async upsertCategorizedSetting(category, name, value, description, isPublic = true, userId = null) {
  try {
    // Validate category
    if (!Object.values(this.CATEGORIES).includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }
    
    // Validate name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Setting name is required and must be a non-empty string');
    }
    
    // Build the key based on category, name, and optionally user ID
    let key = `${category}_${name}`;
    
    if (userId && category === this.CATEGORIES.USER) {
      key = `${key}_${userId}`;
      // console.log('SettingsService: created user-specific key:', key);
    } else if (category === this.CATEGORIES.USER) {
      console.warn('SettingsService: Warning - Creating user setting without userId:', key);
    }
    
    return await this.upsertSetting(key, value, description, isPublic);
  } catch (error) {
    throw new Error(`Error creating/updating categorized setting: ${error.message}`);
  }
}

  /**
   * Create or update a setting
   * 
   * @async
   * @param {string} key - The setting key
   * @param {any} value - The setting value
   * @param {string} [description] - Optional description
   * @param {boolean} [isPublic] - Whether the setting is publicly accessible
   * @returns {Promise<Settings>} The created/updated setting
   * @throws {Error} If key is invalid or database operation fails
   */
  static async upsertSetting(key, value, description, isPublic) {
    try {
      // Validate key
      if (!key || typeof key !== 'string' || key.trim() === '') {
        throw new Error('Setting key is required and must be a non-empty string');
      }
      
      // Ensure value is not undefined (null is allowed)
      if (value === undefined) {
        throw new Error('Setting value cannot be undefined');
      }
      
      // Create update object, only including provided fields
      const updateData = { 
        value,
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic })
      };
      
      // Use findOneAndUpdate with upsert option
      return await Settings.findOneAndUpdate(
        { key },
        updateData,
        { 
          new: true,         // Return updated document
          upsert: true,      // Create if it doesn't exist
          runValidators: true // Run schema validators
        }
      );
    } catch (error) {
      throw new Error(`Error creating/updating setting '${key}': ${error.message}`);
    }
  }

  /**
   * Delete a setting
   * 
   * @async
   * @param {string} key - The setting key
   * @returns {Promise<boolean>} Whether deletion was successful
   * @throws {Error} If key is invalid or database operation fails
   */
  static async deleteSetting(key) {
    try {
      // Validate key
      if (!key || typeof key !== 'string' || key.trim() === '') {
        throw new Error('Setting key is required and must be a non-empty string');
      }
      
      const result = await Settings.deleteOne({ key });
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Error deleting setting '${key}': ${error.message}`);
    }
  }

  /**
   * Initialize default settings if they don't exist
   * 
   * @async
   * @returns {Promise<void>}
   * @throws {Error} If database operation fails
   */
  static async initializeDefaultSettings() {
    try {
      const defaultSettings = [
        // System settings
        { 
          key: 'system_appName', 
          value: 'Currency Exchange App', 
          description: 'Application name displayed in UI', 
          isPublic: true 
        },
        { 
          key: 'system_maintenance', 
          value: false, 
          description: 'Whether the application is in maintenance mode', 
          isPublic: true 
        },
        { 
          key: 'system_contactEmail', 
          value: 'support@example.com', 
          description: 'Support contact email', 
          isPublic: true 
        },
        { 
          key: 'system_footerText', 
          value: '© 2024 Currency Exchange App. All rights reserved.', 
          description: 'Footer text displayed on all pages', 
          isPublic: true 
        },
        
        // Feature flags
        { 
          key: 'feature_allowRegistration', 
          value: true, 
          description: 'Whether new user registration is allowed', 
          isPublic: true 
        },
        { 
          key: 'feature_enableReports', 
          value: true, 
          description: 'Enable reports feature', 
          isPublic: true 
        },
        { 
          key: 'feature_enableNotifications', 
          value: true, 
          description: 'Enable notification system', 
          isPublic: true 
        },
        
        // Configuration values
        { 
          key: 'config_apiRateLimit', 
          value: 100, 
          description: 'Maximum API calls per minute per user', 
          isPublic: false 
        },
        { 
          key: 'config_sessionTimeout', 
          value: 60, 
          description: 'Session timeout in minutes', 
          isPublic: true 
        },
        {
          key: 'config_supportedCurrencies',
          value: ['TTD', 'USD', 'EUR', 'GBP', 'CAD', 'BTC', 'ETH'],
          description: 'List of supported currencies',
          isPublic: true
        }
      ];
      
      for (const setting of defaultSettings) {
        // Only create if doesn't exist (don't overwrite existing settings)
        const exists = await Settings.exists({ key: setting.key });
        if (!exists) {
          await Settings.create(setting);
        }
      }
      
      console.log('Default settings initialized');
    } catch (error) {
      console.error('Error initializing default settings:', error);
      throw new Error(`Failed to initialize default settings: ${error.message}`);
    }
  }
  
  /**
   * Clear all settings (admin use only)
   * 
   * @async
   * @param {boolean} [confirmDeletion=false] - Safety confirmation flag
   * @returns {Promise<boolean>} Whether clearing was successful
   * @throws {Error} If confirmation flag is false or database operation fails
   */
  static async clearAllSettings(confirmDeletion = false) {
    try {
      // Safety check to prevent accidental deletion
      if (!confirmDeletion) {
        throw new Error('Confirmation required to clear all settings');
      }
      
      const result = await Settings.deleteMany({});
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Error clearing settings: ${error.message}`);
    }
  }
}

export default SettingsService;