import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../controllers/authContoller.js";
import protect from "../middleware/authMiddleware.js";

/**
 * Create a new Express router instance.
 * This router will handle all authentication-related routes.
 */
const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 *
 * This route is public because a new user does not have a token yet.
 */
router.post("/register", registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login an existing user
 * @access  Public
 *
 * This route is public because the user must log in first
 * to receive a JWT token.
 */
router.post("/login", loginUser);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 *
 * This route is protected by the `protect` middleware.
 * Flow:
 * 1. Frontend sends JWT token in Authorization header
 * 2. protect middleware verifies token
 * 3. protect middleware attaches user to req.user
 * 4. getCurrentUser controller returns req.user
 */
router.get("/me", protect, getCurrentUser);

/**
 * Export router so it can be used inside app.js
 */
export default router;