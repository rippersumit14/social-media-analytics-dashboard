/**
 * --------------------------------------------------
 * AppError Utility Tests
 * --------------------------------------------------
 *
 * Utility:
 * AppError
 *
 * Responsibilities:
 *
 * • Creates an Error instance
 * • Stores message
 * • Stores status code
 * • Marks success as false
 * • Marks error as operational
 * • Preserves error name
 * • Generates stack trace
 */

import AppError from "../../utils/AppError.js";

/**
 * --------------------------------------------------
 * AppError
 * --------------------------------------------------
 */

describe("AppError", () => {

  /**
   * ----------------------------------------------
   * Instance Creation
   * ----------------------------------------------
   */

  it("should create an instance of AppError", () => {

    const error = new AppError(
      "Something went wrong",
      500
    );

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);

  });

  /**
   * ----------------------------------------------
   * Error Message
   * ----------------------------------------------
   */

  it("should store the provided error message", () => {

    const error = new AppError(
      "User not found",
      404
    );

    expect(error.message)
      .toBe("User not found");

  });

  /**
   * ----------------------------------------------
   * Status Code
   * ----------------------------------------------
   */

  it("should store the provided status code", () => {

    const error = new AppError(
      "Unauthorized",
      401
    );

    expect(error.statusCode)
      .toBe(401);

  });

  /**
   * ----------------------------------------------
   * Default Status Code
   * ----------------------------------------------
   */

  it("should default to status code 500", () => {

    const error = new AppError(
      "Internal Server Error"
    );

    expect(error.statusCode)
      .toBe(500);

  });

  /**
   * ----------------------------------------------
   * Error Name
   * ----------------------------------------------
   */

  it("should set the error name correctly", () => {

    const error = new AppError(
      "Validation Error",
      400
    );

    expect(error.name)
      .toBe("AppError");

  });

  /**
   * ----------------------------------------------
   * Success Flag
   * ----------------------------------------------
   */

  it("should always set success to false", () => {

    const error = new AppError(
      "Bad Request",
      400
    );

    expect(error.success)
      .toBe(false);

  });

  /**
   * ----------------------------------------------
   * Operational Flag
   * ----------------------------------------------
   */

  it("should mark the error as operational", () => {

    const error = new AppError(
      "User not found",
      404
    );

    expect(error.isOperational)
      .toBe(true);

  });

  /**
   * ----------------------------------------------
   * Stack Trace
   * ----------------------------------------------
   */

  it("should generate a stack trace", () => {

    const error = new AppError(
      "Unexpected Error"
    );

    expect(error.stack)
      .toBeDefined();

    expect(typeof error.stack)
      .toBe("string");

  });

});