// routes/authRoutes.js

import express from "express";

/**
 * Controllers
 */
import {
    registerUser,
    loginUser,
    getCurrentUser,
} from "../controllers/authContoller.js";

/**
 * Middlewares
 */
import protect
    from "../middlewares/authMiddleware.js";

import validateRequest
    from "../middlewares/validateRequest.js";

/**
 * Validation Schemas
 */
import {
    registerSchema,
    loginSchema,
} from "../validators/authValidators.js";

/**
 * Create Express router instance
 */
const router = express.Router();

/**
 * ---------------------------------------------------
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 * ---------------------------------------------------
 *
 * Flow:
 * 1. validateRequest validates incoming body
 * 2. controller receives validated data
 * 3. authService handles business logic
 */

router.post(
    "/register",

    validateRequest(registerSchema),

    registerUser
);

/**
 * ---------------------------------------------------
 * @route   POST /api/auth/login
 * @desc    Login existing user
 * @access  Public
 * ---------------------------------------------------
 *
 * Flow:
 * 1. validateRequest validates request body
 * 2. controller delegates login logic
 * 3. authService authenticates user
 */

router.post(
    "/login",

    validateRequest(loginSchema),

    loginUser
);

/**
 * ---------------------------------------------------
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 * ---------------------------------------------------
 *
 * Flow:
 * 1. protect middleware verifies JWT
 * 2. authenticated user attached to req.user
 * 3. controller returns safe user response
 */

router.get(
    "/me",

    protect,

    getCurrentUser
);

/**
 * Export auth router
 */
export default router;