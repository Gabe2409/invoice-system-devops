/**
 * @fileoverview Settings Routes - API endpoints for application settings
 * 
 * @module routes/settingsRoutes
 * @requires express
 * @requires controllers/settingController
 * @requires middleware/authMiddleware
 */

import express from "express";
import {
  getSettings,
  getAppSettings,
  getSettingByKey,
  upsertSetting,
  deleteSetting,
  getSettingsWithDetails
} from "../controllers/settingController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (no authentication needed)
router.get("/public", getSettings);
router.get("/public/:key", getSettingByKey);

// App settings route - structured by category
router.get("/app", getAppSettings);

// Protected routes (authentication required)
router.get("/", protect, getSettings);
router.get("/:key", protect, getSettingByKey);

// Modified POST route to allow users to update their own settings
router.post("/", protect, upsertSetting);

// Admin-only routes
router.put("/:key", protect, adminOnly, upsertSetting);
router.delete("/:key", protect, adminOnly, deleteSetting);
router.get("/admin/all", protect, adminOnly, getSettingsWithDetails);

export default router;
