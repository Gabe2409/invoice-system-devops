/**
 * @fileoverview Core Module - Main entry point
 * 
 * This module serves as the foundation of the Transaction Management System,
 * providing account management, transaction processing, user authentication,
 * and system settings functionality.
 * 
 * @module core
 * @requires express
 */

// Import all route modules
import accountRoutes from "./routes/accountRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

// Import models and services
import Account from "./models/account.js";
import Settings from "./models/settings.js";
import SettingsService from "./services/settingsService.js";

/**
 * Initialize default accounts if they don't exist
 * 
 * @async
 * @private
 * @returns {Promise<void>}
 */
async function initializeAccounts() {
  try {
    // Default currencies to initialize
    const currencies = ["TTD", "USD"];
    let accountsCreated = 0;

    for (const currency of currencies) {
      // Check if account already exists
      const existingAccount = await Account.findOne({ currency });
      
      // Create account if it doesn't exist
      if (!existingAccount) {
        await Account.create({ 
          currency, 
          balance: 0 
        });
        accountsCreated++;
        console.log(`✅ Initialized account for ${currency}`);
      }
    }
    
    if (accountsCreated > 0) {
      console.log(`Created ${accountsCreated} new currency accounts`);
    }
  } catch (error) {
    console.error("❌ Error initializing accounts:", error);
    throw error; // Re-throw to handle in the main initialization
  }
}

/**
 * Check if system settings need initialization
 * Instead of initializing on every start, only check for specific system settings
 * 
 * @async
 * @private
 * @returns {Promise<boolean>} True if settings need initialization
 */
async function needsSettingsInitialization() {
  try {
    // Check for a few critical system settings as markers
    // IMPORTANT: Using lowercase keys to match what's stored in the database
    const criticalSettings = [
      'system_appname', // lowercase to match database storage
      'system_maintenance',
      'feature_allowregistration' // lowercase to match database storage
    ];
    
    // Check if any of these critical settings are missing
    for (const key of criticalSettings) {
      const exists = await Settings.exists({ key });
      if (!exists) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error checking settings initialization:", error);
    // In case of error, assume no initialization needed to prevent crashes
    return false;
  }
}

/**
 * Initialize the core module
 * 
 * @async
 * @param {express.Application} app - Express application instance
 * @returns {Promise<void>}
 */
export async function initModule(app) {
  try {
    console.log("Initializing Core Module...");
    
    // 1) Initialize accounts
    await initializeAccounts();
    
    // 2) Initialize settings if needed, using the existing service method
    const needsInit = await needsSettingsInitialization();
    if (needsInit) {
      console.log("System settings need initialization, setting up defaults...");
      try {
        await SettingsService.initializeDefaultSettings();
        console.log("✅ System settings initialized successfully");
      } catch (settingsError) {
        // Log but continue - non-fatal error
        console.error("⚠️ Settings initialization error:", settingsError);
        console.log("Continuing with startup despite settings error");
      }
    } else {
      console.log("System settings already initialized, skipping.");
    }

    // 3) Mount API routes
    app.use("/api/accounts", accountRoutes);
    app.use("/api/transactions", transactionRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/email", emailRoutes);
    app.use("/api/settings", settingsRoutes);

    console.log("✅ Core module initialized successfully");
  } catch (error) {
    console.error("❌ Core module initialization failed:", error);
    throw error; // Re-throw to allow the main application to handle it
  }
}

/**
 * Module metadata
 */
export const name = "core";
export const version = "1.0.0";
export const description = "Core functionality for transaction management system";