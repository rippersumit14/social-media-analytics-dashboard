/**
 * --------------------------------------------------
 * Authentication Test Helpers
 * --------------------------------------------------
 *
 * Responsibilities:
 *
 * • Create verified users
 * • Create unverified users
 *
 * NOTE:
 *
 * JWT helpers will be added later when
 * we begin testing authenticated routes.
 */

import { createTestUser } from "./factory.js";

/**
 * --------------------------------------------------
 * Create Verified User
 * --------------------------------------------------
 */

export const createVerifiedUser = async (
  overrides = {}
) => {

  const user = await createTestUser({

    isEmailVerified: true,

    ...overrides,

  });

  return user;

};

/**
 * --------------------------------------------------
 * Create Unverified User
 * --------------------------------------------------
 */

export const createUnverifiedUser = async (
  overrides = {}
) => {

  const user = await createTestUser({

    isEmailVerified: false,

    ...overrides,

  });

  return user;

};