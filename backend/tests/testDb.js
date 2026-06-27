/**
 * --------------------------------------------------
 * Test Database Manager
 * --------------------------------------------------
 *
 * Responsibilities:
 *
 * • Start Mongo Memory Server
 * • Connect Mongoose
 * • Clear Collections
 * • Disconnect Database
 * • Stop Mongo Memory Server
 *
 * Used by:
 *
 * • Model Tests
 * • Service Tests
 * • Controller Tests
 * • Route Tests
 * • Integration Tests
 */

import mongoose from "mongoose";

import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

/**
 * --------------------------------------------------
 * Start Test Database
 * --------------------------------------------------
 */

export const connectTestDB = async () => {

  mongoServer =
    await MongoMemoryServer.create();

  const mongoUri =
    mongoServer.getUri();

  await mongoose.connect(
    mongoUri
  );

};

/**
 * --------------------------------------------------
 * Clear Database
 * --------------------------------------------------
 *
 * Removes every document
 * from every collection.
 */

export const clearTestDB = async () => {

  const collections =
    mongoose.connection.collections;

  for (const collection of Object.values(collections)) {

    await collection.deleteMany({});

  }

};

/**
 * --------------------------------------------------
 * Close Test Database
 * --------------------------------------------------
 */

export const disconnectTestDB = async () => {

  await mongoose.connection.close();

  if (mongoServer) {

    await mongoServer.stop();

  }

};