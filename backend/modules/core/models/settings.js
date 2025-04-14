/**
 * @fileoverview Settings Model - Defines the schema for application settings
 * 
 * This model represents application settings, configurations, and user preferences.
 * It supports dynamic types via Mixed schema type and access control via isPublic flag.
 * 
 * @module models/settings
 * @requires mongoose
 */

import mongoose from "mongoose";

/**
 * Settings schema definition
 * 
 * @type {mongoose.Schema}
 */
const settingsSchema = new mongoose.Schema(
  {
    /**
     * Unique setting key identifier (e.g., 'system_appName', 'user_theme_123456')
     * @type {String}
     * @required
     * @unique
     */
    key: {
      type: String,
      required: [true, "Setting key is required"],
      unique: true,
      trim: true,
      validate: {
        validator: function(v) {
          // Ensure key follows proper naming pattern (category_name or category_name_userId)
          return /^[a-zA-Z0-9_]+$/.test(v);
        },
        message: props => `${props.value} is not a valid setting key. Use only letters, numbers, and underscores.`
      }
    },
    
    /**
     * Setting value (can be any type)
     * @type {Mixed}
     * @required
     */
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Setting value is required"]
    },
    
    /**
     * Setting description
     * @type {String}
     * @default ""
     */
    description: {
      type: String,
      default: "",
      trim: true
    },
    
    /**
     * Whether the setting is accessible to non-admin users
     * @type {Boolean}
     * @default true
     */
    isPublic: {
      type: Boolean,
      default: true,
      description: "Determines if this setting is accessible to non-admin users"
    }
  },
  { 
    timestamps: true,
    
    /**
     * Additional schema options
     */
    strict: true, // Enforce schema validation
    
    /**
     * Custom JSON serialization
     */
    toJSON: { 
      virtuals: true,
      /**
       * Transform function to format responses
       */
      transform: function(doc, ret) {
        // Keep type safety - convert booleans and numbers explicitly
        if (typeof ret.value === 'boolean' || typeof ret.value === 'number') {
          ret.value = ret.value;
        }
        return ret;
      }
    }
  }
);

// Create needed indexes
settingsSchema.index({ isPublic: 1 });
settingsSchema.index({ key: 'text' });

/**
 * Get setting category
 * 
 * @virtual
 * @returns {string} The category portion of the setting key
 */
settingsSchema.virtual('category').get(function() {
  if (!this.key) return null;
  const parts = this.key.split('_');
  return parts.length > 0 ? parts[0] : null;
});

/**
 * Get setting name without category
 * 
 * @virtual
 * @returns {string} The name portion of the setting key (without category)
 */
settingsSchema.virtual('name').get(function() {
  if (!this.key) return null;
  const parts = this.key.split('_');
  
  // For user-specific settings (e.g., user_theme_123456)
  if (parts.length >= 3 && parts[0] === 'user') {
    // Return the middle part (without user_ prefix and _userId suffix)
    return parts.slice(1, -1).join('_');
  }
  
  // For regular settings (e.g., system_appName)
  return parts.length > 1 ? parts.slice(1).join('_') : null;
});

/**
 * Pre-save middleware to clean and validate settings data
 */
settingsSchema.pre('save', function(next) {
  // Ensure key is lowercase to prevent duplicates with different casing
  this.key = this.key.toLowerCase();
  
  // Handle empty description
  if (this.description === undefined) {
    this.description = '';
  }
  
  next();
});

/**
 * Settings model
 * @type {mongoose.Model}
 */
const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;