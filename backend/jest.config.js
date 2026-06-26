/**
 * --------------------------------------------------
 * Jest Configuration
 * --------------------------------------------------
 *
 * Central configuration for the entire
 * backend testing ecosystem.
 *
 * Responsibilities:
 *
 * • Discover test files
 * • Configure Node.js environment
 * • Load global setup
 * • Configure code coverage
 * • Improve test output
 * • Configure test timeout
 *
 * This file is automatically loaded
 * whenever Jest starts.
 */

/** @type {import('jest').Config} */

export default {

  /**
   * --------------------------------------------------
   * Test Environment
   * --------------------------------------------------
   *
   * Backend APIs run inside Node.js,
   * not a browser.
   */

  testEnvironment: "node",

  /**
   * --------------------------------------------------
   * Test Discovery
   * --------------------------------------------------
   *
   * Look for every *.test.js file
   * inside the tests directory.
   */

  testMatch: [
    "<rootDir>/tests/**/*.test.js",
  ],

  /**
   * --------------------------------------------------
   * Global Test Setup
   * --------------------------------------------------
   *
   * Executes once before
   * every test suite.
   */

  setupFilesAfterEnv: [
    "<rootDir>/tests/jest.setup.js",
  ],

  /**
   * --------------------------------------------------
   * Module Extensions
   * --------------------------------------------------
   */

  moduleFileExtensions: [
    "js",
    "json",
  ],

  /**
   * --------------------------------------------------
   * Test Timeout
   * --------------------------------------------------
   *
   * AI requests,
   * MongoDB,
   * Redis,
   * Streaming tests
   * may take longer.
   */

  testTimeout: 30000,

  /**
   * --------------------------------------------------
   * Console Output
   * --------------------------------------------------
   */

  verbose: true,

  /**
   * --------------------------------------------------
   * Coverage
   * --------------------------------------------------
   */

  collectCoverage: false,

  coverageDirectory: "coverage",

  /**
   * --------------------------------------------------
   * Coverage Sources
   * --------------------------------------------------
   */

  collectCoverageFrom: [

    "controllers/**/*.js",

    "services/**/*.js",

    "routes/**/*.js",

    "middlewares/**/*.js",

    "models/**/*.js",

    "utils/**/*.js",

    "!tests/**",

    "!coverage/**",

    "!node_modules/**",
  ],

  /**
   * --------------------------------------------------
   * Ignore Paths
   * --------------------------------------------------
   */

  testPathIgnorePatterns: [

    "/node_modules/",

    "/coverage/",
  ],

  /**
   * --------------------------------------------------
   * Clear Mock Data
   * --------------------------------------------------
   */

  clearMocks: true,

  restoreMocks: true,

  resetMocks: true,
};