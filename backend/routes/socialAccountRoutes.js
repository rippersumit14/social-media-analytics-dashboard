import express from "express";
import {
  createSocialAccount,
  getUserSocialAccount,
  syncSocialAccountAnalytics,
} from "../controllers/socialAccountController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/social-accounts
 * @desc    Connect a social account
 * @access  Private
 */
router.post("/", protect, createSocialAccount);

/**
 * @route   GET /api/social-accounts
 * @desc    Get all connected accounts for user
 * @access  Private
 */
router.get("/", protect, getUserSocialAccount);

/**
 * @route   POST /api/social-accounts/:id/sync
 * @desc    Sync analytics for one social account
 * @access  Private
 */
router.post("/:id/sync", protect, syncSocialAccountAnalytics);

export default router;