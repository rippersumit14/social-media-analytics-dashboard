import { z } from "zod";

/**
 * --------------------------------------------------
 * Register Validation
 * --------------------------------------------------
 */

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters"),
});

/**
 * --------------------------------------------------
 * Verify Email OTP Validation
 * --------------------------------------------------
 */

export const verifyEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits"),
});

/**
 * --------------------------------------------------
 * Resend OTP Validation
 * --------------------------------------------------
 */

export const resendOTPSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
});

/**
 * --------------------------------------------------
 * Login Validation
 * --------------------------------------------------
 */

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

/**
 * --------------------------------------------------
 * Update Password Validation
 * --------------------------------------------------
 */

export const updatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),

  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(128, "New password cannot exceed 128 characters"),
});