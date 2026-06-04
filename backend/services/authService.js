import User from "../models/User.js";
import EmailVerificationOTP from "../models/EmailVerificationOTP.js";

import AppError from "../utils/AppError.js";
import { generateOTP } from "../utils/generateOTP.js";

import { sendVerificationEmail } from "./emailService.js";

/**
 * --------------------------------------------------
 * Register User
 * --------------------------------------------------
 *
 * Flow:
 * Create User
 * → Generate OTP
 * → Store OTP
 * → Send Verification Email
 */

export const registerUser = async ({
  name,
  email,
  password,
}) => {
  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new AppError(
      "User already exists with this email",
      409
    );
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  /**
   * Remove any stale OTP records
   */
  await EmailVerificationOTP.deleteMany({
    email,
  });

  const otp = generateOTP();

  const expiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );

  await EmailVerificationOTP.create({
    user: user._id,
    email: user.email,
    otp,
    expiresAt,
  });

  await sendVerificationEmail({
    email: user.email,
    name: user.name,
    otp,
  });

  return {
    user,
    message:
      "Account created successfully. Please verify your email.",
  };
};

/**
 * --------------------------------------------------
 * Verify Email
 * --------------------------------------------------
 *
 * Flow:
 * Validate OTP
 * → Mark User Verified
 * → Remove OTP Records
 */

export const verifyEmail = async ({
  email,
  otp,
}) => {
  const otpRecord =
    await EmailVerificationOTP.findOne({
      email,
      otp,
    });

  if (!otpRecord) {
    throw new AppError(
      "Invalid or expired OTP",
      400
    );
  }

  const user = await User.findById(
    otpRecord.user
  );

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  if (user.isEmailVerified) {
    throw new AppError(
      "Email already verified",
      400
    );
  }

  user.isEmailVerified = true;

  await user.save();

  await EmailVerificationOTP.deleteMany({
    email,
  });

  return {
    message:
      "Email verified successfully",
  };
};

/**
 * --------------------------------------------------
 * Resend Verification OTP
 * --------------------------------------------------
 */

export const resendOTP = async (
  email
) => {
  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  if (user.isEmailVerified) {
    throw new AppError(
      "Email already verified",
      400
    );
  }

  await EmailVerificationOTP.deleteMany({
    email,
  });

  const otp = generateOTP();

  const expiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );

  await EmailVerificationOTP.create({
    user: user._id,
    email,
    otp,
    expiresAt,
  });

  await sendVerificationEmail({
    email,
    name: user.name,
    otp,
  });

  return {
    message:
      "Verification OTP sent successfully",
  };
};

/**
 * --------------------------------------------------
 * Login User
 * --------------------------------------------------
 *
 * Rules:
 * - Email must exist
 * - Password must match
 * - Email must be verified
 */

export const loginUser = async ({
  email,
  password,
}) => {
  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  const isPasswordCorrect =
    await user.comparePassword(
      password
    );

  if (!isPasswordCorrect) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  if (!user.isEmailVerified) {
    throw new AppError(
      "Please verify your email before logging in",
      403
    );
  }

  user.lastLoginAt = new Date();

  await user.save();

  return user;
};

/**
 * --------------------------------------------------
 * Get Current User
 * --------------------------------------------------
 */

export const getCurrentUser = async (
  userId
) => {
  const user = await User.findById(
    userId
  );

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  return user;
};

/**
 * --------------------------------------------------
 * Update Password
 * --------------------------------------------------
 */

export const updatePassword = async ({
  userId,
  currentPassword,
  newPassword,
}) => {
  const user = await User.findById(
    userId
  ).select("+password");

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  const isPasswordCorrect =
    await user.comparePassword(
      currentPassword
    );

  if (!isPasswordCorrect) {
    throw new AppError(
      "Current password is incorrect",
      400
    );
  }

  user.password = newPassword;

  await user.save();

  return {
    message:
      "Password updated successfully",
  };
};