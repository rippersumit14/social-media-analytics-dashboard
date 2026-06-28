/**
 * --------------------------------------------------
 * Test Factory
 * --------------------------------------------------
 *
 * Responsibilities:
 *
 * • Create real MongoDB documents
 * • Provide sensible defaults
 * • Allow overriding any field
 *
 * Current Factories:
 *
 * • createTestUser()
 *
 * This file will grow feature-by-feature
 * as the backend grows.
 */

import User from "../../models/User.js";

import {
  randomEmail,
} from "./testUtils.js";

/**
 * --------------------------------------------------
 * Create Test User
 * --------------------------------------------------
 *
 * Creates a real user document.
 *
 * Password hashing is handled by
 * the User model's pre-save hook.
 */

import EmailVerificationOTP from "../../models/EmailVerificationOTP.js";

export const createTestUser = async (
  overrides = {}
) => {

  const defaultUser = {

    name: "Test User",

    email: randomEmail(),

    password: "Password@123",

    ...overrides,

  };

  const user =
    await User.create(defaultUser);

  return user;

};

/**
 * --------------------------------------------------
 * Create Test Email Verification OTP
 * --------------------------------------------------
 *
 * Creates a real OTP document.
 *
 * Behavior:
 *
 * • Creates a new test user if none is provided.
 * • Accepts either a User document or a User ObjectId.
 * • Uses sensible defaults.
 * • Allows overriding any field.
 */

export const createTestOTP = async (
  overrides = {}
) => {

  let user;

  /**
   * ----------------------------------------------
   * Resolve User
   * ----------------------------------------------
   */

  if (!overrides.user) {

    user = await createTestUser();

  } else if (overrides.user._id) {

    /**
     * Full User document provided.
     */

    user = overrides.user;

  } else {

    /**
     * User ObjectId provided.
     */

    user = await User.findById(
      overrides.user
    );

    if (!user) {

      throw new Error(
        "Test factory could not find the provided user."
      );

    }

  }

  /**
   * ----------------------------------------------
   * Default OTP Document
   * ----------------------------------------------
   */

  const defaultOTP = {

    user: user._id,

    email: user.email,

    otp:
      overrides.otp ??
      "123456",

    expiresAt:
      overrides.expiresAt ??
      new Date(
        Date.now() + 10 * 60 * 1000
      ),

  };

  /**
   * ----------------------------------------------
   * Create Document
   * ----------------------------------------------
   */

  return EmailVerificationOTP.create({

    ...defaultOTP,

    ...overrides,

  });

};