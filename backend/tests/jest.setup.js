/**
 * --------------------------------------------------
 * Global Jest Setup
 * --------------------------------------------------
 *
 * This file is automatically executed
 * before the test suite starts.
 *
 * Responsibilities:
 *
 * • Connect Test Database
 * • Clear Database Before Each Test
 * • Reset Jest Mocks
 * • Disconnect Database
 */

import {
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  jest,
} from "@jest/globals";

import {
  connectTestDatabase,
  clearTestDatabase,
  disconnectTestDatabase,
} from "./testDb.js";

/**
 * --------------------------------------------------
 * Connect Test Database
 * --------------------------------------------------
 *
 * Runs once before the
 * entire test suite.
 */

beforeAll(async () => {

  await connectTestDatabase();

});

/**
 * --------------------------------------------------
 * Reset Database
 * --------------------------------------------------
 *
 * Runs before every
 * individual test.
 */

beforeEach(async () => {

  await clearTestDatabase();

});

/**
 * --------------------------------------------------
 * Reset Jest Mocks
 * --------------------------------------------------
 *
 * Prevents one test
 * from affecting another.
 */

afterEach(() => {

  jest.clearAllMocks();

  jest.restoreAllMocks();

});

/**
 * --------------------------------------------------
 * Disconnect Test Database
 * --------------------------------------------------
 *
 * Runs once after all
 * test suites finish.
 */

afterAll(async () => {

  await disconnectTestDatabase();

});