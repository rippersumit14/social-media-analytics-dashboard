/**
 * --------------------------------------------------
 * EmailVerificationOTP Model Tests
 * --------------------------------------------------
 */

import EmailVerificationOTP from "../../models/EmailVerificationOTP.js";

import { createTestOTP, createTestUser } from "../helpers/factory.js";

describe("EmailVerificationOTP Model", () => {

  /**
   * --------------------------------------------------
   * OTP Creation
   * --------------------------------------------------
   */

  describe("OTP Creation", () => {

    it("should create a valid OTP document", async () => {

      const otp = await createTestOTP();

      expect(otp).toBeDefined();

      expect(otp._id).toBeDefined();

      expect(otp.otp).toBe("123456");

    });

    it("should save the OTP document to the database", async () => {

      const createdOTP = await createTestOTP();

      const savedOTP =
        await EmailVerificationOTP.findById(
          createdOTP._id
        );

      expect(savedOTP).not.toBeNull();

      expect(savedOTP.email)
        .toBe(createdOTP.email);

      expect(savedOTP.otp)
        .toBe(createdOTP.otp);

    });

  });

});




/**
 * --------------------------------------------------
 * Required Fields
 * --------------------------------------------------
 */

describe("Required Fields", () => {

  it("should require a user reference", async () => {

    await expect(

      EmailVerificationOTP.create({

        email: "test@example.com",

        otp: "123456",

        expiresAt: new Date(),

      })

    ).rejects.toThrow();

  });

  it("should require an email", async () => {

    const { _id } = await createTestUser();

    await expect(

      EmailVerificationOTP.create({

        user: _id,

        otp: "123456",

        expiresAt: new Date(),

      })

    ).rejects.toThrow();

  });

  it("should require an OTP", async () => {

    const user = await createTestUser();

    await expect(

      EmailVerificationOTP.create({

        user: user._id,

        email: user.email,

        expiresAt: new Date(),

      })

    ).rejects.toThrow();

  });

  it("should require an expiration date", async () => {

    const user = await createTestUser();

    await expect(

      EmailVerificationOTP.create({

        user: user._id,

        email: user.email,

        otp: "123456",

      })

    ).rejects.toThrow();

  });

});


/**
 * --------------------------------------------------
 * Stored Values
 * --------------------------------------------------
 */

describe("Stored Values", () => {

  it("should store the correct user reference", async () => {

    const otp = await createTestOTP();

    expect(
      otp.user.toString()
    ).toBeDefined();

  });

  it("should store the email in lowercase", async () => {

    const otp = await createTestOTP({

      email: "TEST@EXAMPLE.COM",

    });

    expect(otp.email)
      .toBe("test@example.com");

  });

  it("should store the OTP correctly", async () => {

    const otp = await createTestOTP({

      otp: "654321",

    });

    expect(otp.otp)
      .toBe("654321");

  });

  it("should store the expiration date", async () => {

    const expiry =
      new Date(Date.now() + 600000);

    const otp = await createTestOTP({

      expiresAt: expiry,

    });

    expect(
      otp.expiresAt.getTime()
    ).toBe(expiry.getTime());

  });

});


/**
 * --------------------------------------------------
 * JSON Serialization
 * --------------------------------------------------
 */

describe("JSON Serialization", () => {

  it("should remove __v from JSON output", async () => {

    const otp = await createTestOTP();

    const json = otp.toJSON();

    expect(json.__v)
      .toBeUndefined();

  });

});