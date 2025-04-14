/**
 * @fileoverview Reporting Routes - API endpoints for reporting functionality
 *
 * This file defines all the routes for the reporting module.
 *
 * @module routes/reportingRoutes
 * @requires express
 * @requires controllers/reportingController
 * @requires middleware/authMiddleware
 */

import express from "express";
import reportingController from "../controllers/reportingController.js";
import reportConfigController from "../controllers/reportConfigController.js";
// Updated import path to match your project structure
import { protect, adminOnly } from "../../core/middleware/authMiddleware.js";

const router = express.Router();

// All reporting routes should be protected and accessible only to authorized users
router.use(protect);

/**
 * @route   GET /api/reports/revenue
 * @desc    Get revenue data with filtering and grouping options
 * @access  Private
 */
router.get("/revenue", reportingController.getRevenueData);

/**
 * @route   GET /api/reports/currency-summary
 * @desc    Get transaction summary by currency
 * @access  Private
 */
router.get("/currency-summary", reportingController.getCurrencySummary);

/**
 * @route   GET /api/reports/transaction-types
 * @desc    Get transaction volumes by type
 * @access  Private
 */
router.get("/transaction-types", reportingController.getTransactionTypeAnalytics);

/**
 * @route   GET /api/reports/customer-analytics
 * @desc    Get customer analytics
 * @access  Private
 */
router.get("/customer-analytics", reportingController.getCustomerAnalytics);

/**
 * @route   GET /api/reports/export
 * @desc    Export transaction data in specified format
 * @access  Private
 */
router.get("/export", reportingController.exportTransactionData);

/**
 * @route   GET /api/reports/currencies
 * @desc    Get supported currencies for reports
 * @access  Private
 */
router.get("/currencies", reportingController.getSupportedCurrencies);

/**
 * @route   GET /api/reports/admin-summary
 * @desc    Get admin-only comprehensive summary
 * @access  Admin only
 */
router.get("/admin-summary", adminOnly, reportingController.getTransactionSummary);

/**
 * Report Configurations Routes
 */

/**
 * @route   POST /api/reports/configs
 * @desc    Create a new report configuration
 * @access  Private
 */
router.post("/configs", reportConfigController.createReportConfig);

/**
 * @route   GET /api/reports/configs
 * @desc    Get all report configurations for the user
 * @access  Private
 */
router.get("/configs", reportConfigController.getReportConfigs);

/**
 * @route   GET /api/reports/configs/:id
 * @desc    Get a single report configuration
 * @access  Private
 */
router.get("/configs/:id", reportConfigController.getReportConfigById);

/**
 * @route   PUT /api/reports/configs/:id
 * @desc    Update a report configuration
 * @access  Private
 */
router.put("/configs/:id", reportConfigController.updateReportConfig);

/**
 * @route   DELETE /api/reports/configs/:id
 * @desc    Delete a report configuration
 * @access  Private
 */
router.delete("/configs/:id", reportConfigController.deleteReportConfig);

export default router;