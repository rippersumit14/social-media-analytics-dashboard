import User from "../models/User.js";
import EmailVerificationOTP from "../models/EmailVerificationOTP.js";

import AppError from "../utils/AppError.js";
import { generateOTP } from "../utils/generateOTP.js";

import { deliverVerificationEmail } from "../jobs/emailQueue.js";

const OTP_EXPIRY_MS =
  10 * 60 * 1000;

const OTP_RESEND_COOLDOWN_MS =
  Number(
    process.env.OTP_RESEND_COOLDOWN_MS
  ) || 60 * 1000;

const normalizeEmail = (email = "") =>
  email.trim().toLowerCase();

const createAndDeliverOTP = async ({
  user,
  purpose,
  enforceCooldown = false,
}) => {
  const latestOtp =
    await EmailVerificationOTP
      .findOne({
        email:
          user.email,
      })
      .sort({
        createdAt:
          -1,
      });

  if (
    enforceCooldown &&
    latestOtp?.createdAt &&
    Date.now() -
      latestOtp.createdAt.getTime() <
      OTP_RESEND_COOLDOWN_MS
  ) {
    throw new AppError(
      "Please wait before requesting another verification OTP.",
      429
    );
  }

  const otp = generateOTP();

  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MS
  );

  const otpRecord =
    await EmailVerificationOTP.create({
      user:
        user._id,
      email:
        user.email,
      otp,
      expiresAt,
    });

  try {
    await deliverVerificationEmail({
      email:
        user.email,
      name:
        user.name,
      otp,
      purpose,
      userId:
        user._id.toString(),
    });

    await EmailVerificationOTP.deleteMany({
      email:
        user.email,
      _id: {
        $ne:
          otpRecord._id,
      },
    });

    return otpRecord;
  } catch (error) {
    await EmailVerificationOTP.deleteOne({
      _id:
        otpRecord._id,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Verification email could not be delivered. Please try again later.",
      503
    );
  }
};

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
  const normalizedEmail =
    normalizeEmail(email);

  const existingUser = await User.findOne({
    email:
      normalizedEmail,
  });

  if (
    existingUser?.isEmailVerified
  ) {
    throw new AppError(
      "User already exists with this email",
      409
    );
  }

  if (existingUser) {
    await createAndDeliverOTP({
      user:
        existingUser,
      purpose:
        "registration-recovery",
      enforceCooldown:
        true,
    });

    return {
      user:
        existingUser,
      verificationPending:
        true,
      message:
        "Email verification is pending. A new verification OTP has been sent.",
    };
  }

  const user =
    await User.create({
      name,
      email:
        normalizedEmail,
      password,
    });

  try {
    await createAndDeliverOTP({
      user,
      purpose:
        "registration",
    });
  } catch (error) {
    await Promise.allSettled([
      EmailVerificationOTP.deleteMany({
        user:
          user._id,
      }),
      User.deleteOne({
        _id:
          user._id,
      }),
    ]);

    throw error;
  }

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
  const normalizedEmail =
    normalizeEmail(email);

  const otpRecord =
    await EmailVerificationOTP.findOne({
      email:
        normalizedEmail,
      otp,
    });

  if (
    !otpRecord ||
    otpRecord.expiresAt <= new Date()
  ) {
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
    email:
      normalizedEmail,
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
  const normalizedEmail =
    normalizeEmail(email);

  const user = await User.findOne({
    email:
      normalizedEmail,
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

  await createAndDeliverOTP({
    user,
    purpose:
      "resend",
    enforceCooldown:
      true,
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
  const normalizedEmail =
    normalizeEmail(email);

  const user = await User.findOne({
    email:
      normalizedEmail,
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
