/**
 * --------------------------------------------------
 * Generate OTP Utility Tests
 * --------------------------------------------------
 *
 * Utility:
 * generateOTP()
 *
 * Responsibilities:
 *
 * • Returns a string
 * • Always returns 6 digits
 * • Contains only numbers
 * • Never returns null
 * • Never returns undefined
 * • Produces different values
 */

import { generateOTP } from "../../utils/generateOTP.js";

/**
 * --------------------------------------------------
 * Generate OTP
 * --------------------------------------------------
 */

describe("generateOTP()", () => {

  /**
   * ----------------------------------------------
   * Return Type
   * ----------------------------------------------
   */

  it("should return a string", () => {

    const otp = generateOTP();

    expect(typeof otp).toBe("string");

  });

  /**
   * ----------------------------------------------
   * OTP Length
   * ----------------------------------------------
   */

  it("should always return exactly 6 digits", () => {

    const otp = generateOTP();

    expect(otp).toHaveLength(6);

  });

  /**
   * ----------------------------------------------
   * Numeric Only
   * ----------------------------------------------
   */

  it("should contain only numeric characters", () => {

    const otp = generateOTP();

    expect(otp).toMatch(/^\d{6}$/);

  });

  /**
   * ----------------------------------------------
   * Null Check
   * ----------------------------------------------
   */

  it("should never return null", () => {

    const otp = generateOTP();

    expect(otp).not.toBeNull();

  });

  /**
   * ----------------------------------------------
   * Undefined Check
   * ----------------------------------------------
   */

  it("should never return undefined", () => {

    const otp = generateOTP();

    expect(otp).not.toBeUndefined();

  });

  /**
   * ----------------------------------------------
   * Randomness
   * ----------------------------------------------
   */

  it("should generate different OTPs on multiple calls", () => {

    const generatedOtps = new Set(); 

    for (let index = 0; index < 100; index++) {

      generatedOtps.add(
        generateOTP()
      );

    }

    /**
     * Since OTPs are random,
     * we expect more than one
     * unique value.
     */

    expect(
      generatedOtps.size
    ).toBeGreaterThan(1);

  });

});