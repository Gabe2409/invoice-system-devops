/**
 * @fileoverview Account Routes - API endpoints for account operations
 * 
 * @module routes/accountRoutes
 * @requires express
 * @requires controllers/accountController
 * @requires middleware/authMiddleware
 */

import express from "express";
import { getAccounts, getAccountByCurrency } from "../controllers/accountController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all accounts
router.get("/", getAccounts);

// Get specific account by currency
router.get("/:currency", getAccountByCurrency);

export default router;