
/**
 * @fileoverview Auth Routes - API endpoints for authentication
 * 
 * @module routes/authRoutes
 * @requires express
 * @requires controllers/authController
 * @requires middleware/authMiddleware
 */

import express from "express";
import { 
  loginUser, 
  registerUser, 
  refreshToken,
  getUserProfile
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/login", loginUser);
router.post("/refresh", refreshToken);

// Protected routes
router.get("/profile", protect, getUserProfile);

// Admin only routes
router.post("/register", protect, adminOnly, registerUser);

export default router;