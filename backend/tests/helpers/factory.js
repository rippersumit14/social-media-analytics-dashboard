import bcrypt from "bcryptjs";

import User from "../../models/User.js";

/**
 * --------------------------------------------------
 * Generate Random Value
 * --------------------------------------------------
 *
 * Prevents duplicate values
 * during test execution.
 */

const random =
  () =>
    Math.random()
      .toString(36)
      .substring(2, 10);

/**
 * --------------------------------------------------
 * Create Test User
 * --------------------------------------------------
 *
 * Creates and stores
 * a user in the test database.
 */

export const createTestUser =
  async (
    overrides = {}
  ) => {

    /**
     * Default password
     */

    const password =
      overrides.password ||
      "Password@123";

    /**
     * Hash password
     */

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    /**
     * Create user
     */

    const user =
      await User.create({

        name:
          overrides.name ||
          `Test User ${random()}`,

        email:
          overrides.email ||
          `user_${random()}@test.com`,

        password:
          hashedPassword,

        ...overrides,
      });

    /**
     * Return user
     * along with the plain password.
     */

    return {

      user,

      password,
    };
  };