/**
 * --------------------------------------------------
 * Global Jest Setup
 * --------------------------------------------------
 *
 * Responsibilities:
 *
 * • Connect Mongo Memory Server
 * • Clear Database After Every Test
 * • Disconnect Database
 *
 * This file is executed automatically
 * before every test suite.
 */

import {
  beforeAll,
  afterEach,
  afterAll,
} from "@jest/globals";

import {
  connectTestDB,
  clearTestDB,
  disconnectTestDB,
} from "./testDb.js";

/**
 * --------------------------------------------------
 * Connect Test Database
 * --------------------------------------------------
 */

beforeAll(async () => {

  await connectTestDB();

});

/**
 * --------------------------------------------------
 * Clean Database
 * --------------------------------------------------
 *
 * Runs after every individual test.
 */

afterEach(async () => {

  await clearTestDB();

});

/**
 * --------------------------------------------------
 * Disconnect Test Database
 * --------------------------------------------------
 */

afterAll(async () => {

  await disconnectTestDB();

});
