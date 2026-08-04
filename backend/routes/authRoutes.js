import express from "express";

import {
  registerUser,
  loginUser,
  loginWithGoogle,
  getCurrentUser,
  updatePassword,
} from "../controllers/authController.js";

import protect from "../middlewares/authMiddleware.js";
import validateRequest from "../middlewares/validateRequest.js";
import { authRateLimiter } from "../middlewares/rateLimiter.js";

import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  updatePasswordSchema,
} from "../validators/authValidators.js";

const router = express.Router();

router.post(
  "/register",
  authRateLimiter,
  validateRequest(registerSchema),
  registerUser
);

router.post(
  "/login",
  authRateLimiter,
  validateRequest(loginSchema),
  loginUser
);

router.post(
  "/google",
  authRateLimiter,
  validateRequest(googleLoginSchema),
  loginWithGoogle
);

router.get(
  "/me",
  protect,
  getCurrentUser
);

router.patch(
  "/password",
  protect,
  authRateLimiter,
  validateRequest(updatePasswordSchema),
  updatePassword
);

export default router;
