import mongoose from "mongoose";

/**
 * --------------------------------------------------
 * Generate Random String
 * --------------------------------------------------
 *
 * Generates a random alphanumeric
 * string for test data.
 */

export const randomString = (
  length = 8
) => {

  return Math.random()
    .toString(36)
    .substring(2, 2 + length);

};

/**
 * --------------------------------------------------
 * Generate Random Email
 * --------------------------------------------------
 *
 * Prevents duplicate email
 * conflicts during tests.
 */

export const randomEmail = () => {

  return `test_${randomString()}@example.com`;

};

/**
 * --------------------------------------------------
 * Generate Random Username
 * --------------------------------------------------
 */

export const randomUsername = () => {

  return `user_${randomString()}`;

};

/**
 * --------------------------------------------------
 * Generate Random Title
 * --------------------------------------------------
 */

export const randomTitle = (
  prefix = "Test"
) => {

  return `${prefix} ${randomString(6)}`;

};

/**
 * --------------------------------------------------
 * Generate Mongo ObjectId
 * --------------------------------------------------
 *
 * Useful for invalid ownership
 * and authorization tests.
 */

export const generateObjectId = () => {

  return new mongoose.Types.ObjectId();

};

/**
 * --------------------------------------------------
 * Sleep Utility
 * --------------------------------------------------
 *
 * Useful for:
 *
 * • Streaming tests
 * • Retry tests
 * • Automation jobs
 */

export const sleep = async (
  milliseconds
) => {

  return new Promise(

    (resolve) =>

      setTimeout(
        resolve,
        milliseconds
      )

  );

};

/**
 * --------------------------------------------------
 * Build Authorization Header
 * --------------------------------------------------
 *
 * Converts a JWT token into
 * a valid Authorization header.
 */

export const buildAuthHeader = (
  token
) => {

  return {

    Authorization:
      `Bearer ${token}`,
  };

};