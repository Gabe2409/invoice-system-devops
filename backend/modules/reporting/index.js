/**
 * @fileoverview Reporting Module - Main entry point
 * 
 * This module provides comprehensive reporting functionality for the Transaction 
 * Management System, including financial summaries, transaction analytics,
 * and exportable reports.
 * 
 * @module reporting
 * @requires express
 */

import reportingRoutes from "./routes/reportingRoutes.js";

/**
 * Initialize the reporting module
 * 
 * @async
 * @param {express.Application} app - Express application instance
 * @returns {Promise<void>}
 */
export async function initModule(app) {
  try {
    console.log("Initializing Reporting Module...");
    
    // Mount API routes
    app.use("/api/reports", reportingRoutes);

    console.log("✅ Reporting module initialized successfully");
  } catch (error) {
    console.error("❌ Reporting module initialization failed:", error);
    throw error; // Re-throw to allow the main application to handle it
  }
}

/**
 * Module metadata
 */
export const name = "reporting";
export const version = "1.0.0";
export const description = "Advanced reporting functionality for transaction management system";