import asyncHandler from "../middlewares/asyncHandler.js";

import ApiResponse from "../utils/ApiResponse.js";

import generateToken from "../utils/generateToken.js";

import {
  registerUser as registerUserService,
  verifyEmail as verifyEmailService,
  resendOTP as resendOTPService,
  loginUser as loginUserService,
  getCurrentUser as getCurrentUserService,
  updatePassword as updatePasswordService,
} from "../services/authService.js";

/**
 * --------------------------------------------------
 * Register User
 * --------------------------------------------------
 * POST /api/auth/register
 * Public
 */

export const registerUser = asyncHandler(
  async (req, res) => {
    const result =
      await registerUserService(
        req.body
      );

    return res.status(201).json(
      new ApiResponse({
        statusCode: 201,
        message:
          "User registered successfully. Please verify your email.",
        data: result,
      })
    );
  }
);

/**
 * --------------------------------------------------
 * Verify Email OTP
 * --------------------------------------------------
 * POST /api/auth/verify-email
 * Public
 */

export const verifyEmail =
  asyncHandler(
    async (req, res) => {
      const result =
        await verifyEmailService(
          req.body
        );

      return res.status(200).json(
        new ApiResponse({
          statusCode: 200,
          message:
            result.message,
        })
      );
    }
  );

/**
 * --------------------------------------------------
 * Resend Verification OTP
 * --------------------------------------------------
 * POST /api/auth/resend-otp
 * Public
 */

export const resendOTP =
  asyncHandler(
    async (req, res) => {
      const result =
        await resendOTPService(
          req.body.email
        );

      return res.status(200).json(
        new ApiResponse({
          statusCode: 200,
          message:
            result.message,
        })
      );
    }
  );

/**
 * --------------------------------------------------
 * Login User
 * --------------------------------------------------
 * POST /api/auth/login
 * Public
 */

export const loginUser =
  asyncHandler(
    async (req, res) => {
      const user =
        await loginUserService(
          req.body
        );

      const token =
        generateToken(
          user._id
        );

      return res.status(200).json(
        new ApiResponse({
          statusCode: 200,
          message:
            "Login successful",
          data: {
            user,
            token,
          },
        })
      );
    }
  );

/**
 * --------------------------------------------------
 * Get Current User
 * --------------------------------------------------
 * GET /api/auth/me
 * Private
 */

export const getCurrentUser =
  asyncHandler(
    async (req, res) => {
      const user =
        await getCurrentUserService(
          req.user.id
        );

      return res.status(200).json(
        new ApiResponse({
          statusCode: 200,
          message:
            "Current user fetched successfully",
          data: user,
        })
      );
    }
  );

/**
 * --------------------------------------------------
 * Update Password
 * --------------------------------------------------
 * PATCH /api/auth/password
 * Private
 */

export const updatePassword =
  asyncHandler(
    async (req, res) => {
      const result =
        await updatePasswordService({
          userId:
            req.user.id,

          currentPassword:
            req.body.currentPassword,

          newPassword:
            req.body.newPassword,
        });

      return res.status(200).json(
        new ApiResponse({
          statusCode: 200,
          message:
            result.message,
        })
      );
    }
  );