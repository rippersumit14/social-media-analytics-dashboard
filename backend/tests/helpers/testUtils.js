/**
 * --------------------------------------------------
 * Test Utility Helpers
 * --------------------------------------------------
 *
 * Generic helper functions used across
 * the entire backend test suite.
 *
 * Responsibilities:
 *
 * • Generate random test data
 * • Generate ObjectIds
 * • Generate dates
 * • Sleep utility
 */

import mongoose from "mongoose";

/**
 * --------------------------------------------------
 * Random Email
 * --------------------------------------------------
 */

export const randomEmail = () => {

  return `test-${Date.now()}-${Math.floor(
    Math.random() * 10000
  )}@example.com`;

};

/**
 * --------------------------------------------------
 * Random String
 * --------------------------------------------------
 */

export const randomString = (
  length = 12
) => {

  return Math.random()
    .toString(36)
    .substring(2, 2 + length);

};

/**
 * --------------------------------------------------
 * Random ObjectId
 * --------------------------------------------------
 */

export const randomObjectId = () => {

  return new mongoose.Types.ObjectId();

};

/**
 * --------------------------------------------------
 * Future Date
 * --------------------------------------------------
 */

export const futureDate = (
  minutes = 10
) => {

  return new Date(
    Date.now() + minutes * 60 * 1000
  );

};

/**
 * --------------------------------------------------
 * Past Date
 * --------------------------------------------------
 */

export const pastDate = (
  minutes = 10
) => {

  return new Date(
    Date.now() - minutes * 60 * 1000
  );

};

/**
 * --------------------------------------------------
 * Sleep
 * --------------------------------------------------
 *
 * Useful when testing retries,
 * delays or polling behaviour.
 */

export const sleep = (
  milliseconds
) => {

  return new Promise(
    (resolve) => {

      setTimeout(
        resolve,
        milliseconds
      );

    }
  );

};