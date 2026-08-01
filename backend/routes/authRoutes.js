import express from "express";

/**
 * Controllers
 */

import {
  registerUser,
  verifyEmail,
  resendOTP,
  loginUser,
  getCurrentUser,
  updatePassword,
} from "../controllers/authController.js";

/**
 * Middlewares
 */

import protect from "../middlewares/authMiddleware.js";

import validateRequest from "../middlewares/validateRequest.js";
import { authRateLimiter } from "../middlewares/rateLimiter.js";

/**
 * Validation Schemas
 */

import {
  registerSchema,
  verifyEmailSchema,
  resendOTPSchema,
  loginSchema,
  updatePasswordSchema,
} from "../validators/authValidators.js";

/**
 * Router
 */

const router = express.Router();


/**
 * --------------------------------------------------
 * Register User
 * --------------------------------------------------
 * POST /api/auth/register
 * Public
 */

router.post(
  "/register",
  authRateLimiter,
  validateRequest(registerSchema),
  registerUser
);

/**
 * --------------------------------------------------
 * Verify Email OTP
 * --------------------------------------------------
 * POST /api/auth/verify-email
 * Public
 */

router.post(
  "/verify-email",
  authRateLimiter,
  validateRequest(verifyEmailSchema),
  verifyEmail
);

/**
 * --------------------------------------------------
 * Resend OTP
 * --------------------------------------------------
 * POST /api/auth/resend-otp
 * Public
 */

router.post(
  "/resend-otp",
  authRateLimiter,
  validateRequest(resendOTPSchema),
  resendOTP
);

/**
 * --------------------------------------------------
 * Login User
 * --------------------------------------------------
 * POST /api/auth/login
 * Public
 */

router.post(
  "/login",
  authRateLimiter,
  validateRequest(loginSchema),
  loginUser
);

/**
 * --------------------------------------------------
 * Get Current User
 * --------------------------------------------------
 * GET /api/auth/me
 * Private
 */

router.get(
  "/me",
  protect,
  getCurrentUser
);

/**
 * --------------------------------------------------
 * Update Password
 * --------------------------------------------------
 * PATCH /api/auth/password
 * Private
 */

router.patch(
  "/password",
  protect,
  authRateLimiter,
  validateRequest(updatePasswordSchema),
  updatePassword
);

/**
 * Export Router
 */

export default router;
