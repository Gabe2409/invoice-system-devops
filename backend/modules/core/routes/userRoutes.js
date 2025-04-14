/**
 * @fileoverview User Routes - API endpoints for user management
 * 
 * @module routes/userRoutes
 * @requires express
 * @requires controllers/userController
 * @requires middleware/authMiddleware
 */

import express from "express";
import { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  resetUserPin,
  updateUserStatus,
  updateProfile
} from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);

// Profile routes (available to all authenticated users)
router.put("/profile", updateProfile);

// Admin-only routes
router.use(adminOnly);

// User CRUD operations (admin only)
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.patch("/:id/status", updateUserStatus);
router.delete("/:id", deleteUser);
router.post("/:id/reset-pin", resetUserPin);

export default router;