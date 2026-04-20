import express from "express";
import {
    createSocialAccount,
    getUserSocialAccount,
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

export default router;