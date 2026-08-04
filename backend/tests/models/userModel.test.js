/**
 * --------------------------------------------------
 * User Model Tests
 * --------------------------------------------------
 *
 * Tests the User mongoose model.
 */

import User from "../../models/User.js";

import { createTestUser } from "../helpers/factory.js";

describe("User Model", () => {

  /**
   * --------------------------------------------------
   * User Creation
   * --------------------------------------------------
   */

  describe("User Creation", () => {

    it("should create a valid user", async () => {

      const user = await createTestUser();

      expect(user).toBeDefined();

      expect(user._id).toBeDefined();

      expect(user.name).toBe("Test User");

      expect(user.email).toContain("@example.com");

    });

    it("should save the user to the database", async () => {

      const createdUser = await createTestUser();

      const savedUser = await User.findById(
        createdUser._id
      );

      expect(savedUser).not.toBeNull();

      expect(savedUser.email)
        .toBe(createdUser.email);

    });

  });

});

/**
 * --------------------------------------------------
 * Default Values
 * --------------------------------------------------
 */

describe("Default Values", () => {

  it("should default isEmailVerified to true", async () => {

    const user = await createTestUser();

    expect(user.isEmailVerified).toBe(true);

  });

  it("should default authProvider to local", async () => {

    const user = await createTestUser();

    expect(user.authProvider).toBe("local");

  });

  it("should default plan to FREE", async () => {

    const user = await createTestUser();

    expect(user.plan).toBe("FREE");

  });

  it("should default aiUsageCount to 0", async () => {

    const user = await createTestUser();

    expect(user.aiUsageCount).toBe(0);

  });

  it("should default avatar to an empty string", async () => {

    const user = await createTestUser();

    expect(user.avatar).toBe("");

  });

  it("should default isActive to true", async () => {

    const user = await createTestUser();

    expect(user.isActive).toBe(true);

  });

  it("should initialize aiUsageResetDate", async () => {

    const user = await createTestUser();

    expect(user.aiUsageResetDate).toBeInstanceOf(Date);

  });

  it("should default lastLoginAt to null", async () => {

    const user = await createTestUser();

    expect(user.lastLoginAt).toBeNull();

  });

});

/**
 * --------------------------------------------------
 * Password Security
 * --------------------------------------------------
 */

describe("Password Security", () => {

  it("should hash the password before saving", async () => {

    const plainPassword = "Password@123";

    const user = await createTestUser({
      password: plainPassword,
    });

    /**
     * Password stored in database
     * should not equal the original.
     */

    expect(user.password)
      .not.toBe(plainPassword);

  });

  it("should compare the correct password successfully", async () => {

    const plainPassword = "Password@123";

    const user = await createTestUser({
      password: plainPassword,
    });

    /**
     * Need password because
     * select:false in schema.
     */

    const savedUser = await User
      .findById(user._id)
      .select("+password");

    const isMatch =
      await savedUser.comparePassword(
        plainPassword
      );

    expect(isMatch).toBe(true);

  });

  it("should reject an incorrect password", async () => {

    const user = await createTestUser({
      password: "Password@123",
    });

    const savedUser = await User
      .findById(user._id)
      .select("+password");

    const isMatch =
      await savedUser.comparePassword(
        "WrongPassword"
      );

    expect(isMatch).toBe(false);

  });

});

/**
 * --------------------------------------------------
 * Validation Rules
 * --------------------------------------------------
 */

describe("Validation Rules", () => {

  it("should require a name", async () => {

    await expect(

      User.create({

        email: "test@example.com",

        password: "Password@123",

      })

    ).rejects.toThrow();

  });

  it("should require an email", async () => {

    await expect(

      User.create({

        name: "Test User",

        password: "Password@123",

      })

    ).rejects.toThrow();

  });

  it("should reject an invalid email", async () => {

    await expect(

      User.create({

        name: "Test User",

        email: "invalid-email",

        password: "Password@123",

      })

    ).rejects.toThrow();

  });

  it("should reject passwords shorter than 6 characters", async () => {

    await expect(

      User.create({

        name: "Test User",

        email: "test@example.com",

        password: "123",

      })

    ).rejects.toThrow();

  });

  it("should allow Google users without a password", async () => {

    const user = await User.create({

      name: "Google User",

      email: "google-user@example.com",

      authProvider: "google",

      googleId: "google-user-id",

    });

    expect(user.password).toBeUndefined();

    expect(user.authProvider).toBe("google");

  });

});


/**
 * --------------------------------------------------
 * Custom Model Methods
 * --------------------------------------------------
 */

describe("Custom Model Methods", () => {

  it("should reset AI usage correctly", async () => {

    const user = await createTestUser({

      aiUsageCount: 25,

    });

    user.resetAIUsage();

    expect(user.aiUsageCount).toBe(0);

    expect(user.aiUsageResetDate)
      .toBeInstanceOf(Date);

  });

});


/**
 * --------------------------------------------------
 * JSON Serialization
 * --------------------------------------------------
 */

describe("JSON Serialization", () => {

  it("should remove the password field", async () => {

    const user = await createTestUser();

    const savedUser = await User
      .findById(user._id)
      .select("+password");

    const json = savedUser.toJSON();

    expect(json.password)
      .toBeUndefined();

  });

  it("should remove the __v field", async () => {

    const user = await createTestUser();

    const json = user.toJSON();

    expect(json.__v)
      .toBeUndefined();

  });

});
