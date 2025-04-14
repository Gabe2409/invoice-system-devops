/**
 * @fileoverview Transaction Routes - API endpoints for transaction operations
 * 
 * @module routes/transactionRoutes
 * @requires express
 * @requires controllers/transactionController
 * @requires middleware/authMiddleware
 */

import express from "express";
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  sendTransactionReceipt,
  getTransactionSummary
} from "../controllers/transactionController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Basic transaction operations
router.post("/", createTransaction);
router.get("/", getTransactions);
router.get("/summary", getTransactionSummary);
router.get("/:id", getTransactionById);

// Email receipt
router.post("/:id/send-receipt", sendTransactionReceipt);

// Admin or creator only operations
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;