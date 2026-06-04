import mongoose from "mongoose";

/**
 * --------------------------------------------------
 * Email Verification OTP Schema
 * --------------------------------------------------
 *
 * Purpose:
 * Store temporary OTPs used for
 * mandatory email verification.
 *
 * Flow:
 *
 * Register
 *   ↓
 * Generate OTP
 *   ↓
 * Save OTP
 *   ↓
 * Send Email
 *   ↓
 * Verify OTP
 *   ↓
 * Mark User Verified
 *   ↓
 * Delete OTP
 *
 */

const emailVerificationOTPSchema =
  new mongoose.Schema(
    {
      /**
       * User Reference
       */
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      /**
       * Email Address
       *
       * Stored for easier querying
       * during verification.
       */
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
      },

      /**
       * 6 Digit OTP
       *
       * Example:
       * 483921
       */
      otp: {
        type: String,
        required: true,
      },

      /**
       * OTP Expiration
       *
       * Usually:
       * 10 minutes
       */
      expiresAt: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

/**
 * --------------------------------------------------
 * Indexes
 * --------------------------------------------------
 */

/**
 * Fast lookup during verification
 */
emailVerificationOTPSchema.index({
  email: 1,
  otp: 1,
});

/**
 * Automatic OTP cleanup
 *
 * MongoDB TTL Index
 *
 * Once expiresAt passes,
 * MongoDB automatically
 * deletes the document.
 */
emailVerificationOTPSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

/**
 * --------------------------------------------------
 * JSON Transform
 * --------------------------------------------------
 */

emailVerificationOTPSchema.set(
  "toJSON",
  {
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    },
  }
);

/**
 * --------------------------------------------------
 * Model Export
 * --------------------------------------------------
 */

const EmailVerificationOTP =
  mongoose.model(
    "EmailVerificationOTP",
    emailVerificationOTPSchema
  );

export default EmailVerificationOTP;