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
 */

export const createTestOTP = async (
  overrides = {}
) => {

  const user = overrides.user
    ? { _id: overrides.user }
    : await createTestUser();

  const defaultOTP = {

    user: user._id,

    email: user.email,

    otp: "123456",

    expiresAt: new Date(
      Date.now() + 10 * 60 * 1000
    ),

    ...overrides,

  };

  return EmailVerificationOTP.create(
    defaultOTP
  );

};