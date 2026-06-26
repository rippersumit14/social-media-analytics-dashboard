import mongoose from "mongoose";

import {
  MongoMemoryServer,
} from "mongodb-memory-server";

/**
 * --------------------------------------------------
 * Mongo Memory Server Instance
 * --------------------------------------------------
 *
 * Stores the temporary in-memory
 * MongoDB instance used during testing.
 */

let mongoServer;

/**
 * --------------------------------------------------
 * Connect Test Database
 * --------------------------------------------------
 *
 * Responsibilities:
 *
 * • Start Mongo Memory Server
 * • Get temporary connection URI
 * • Connect Mongoose
 */

export const connectTestDatabase =
  async () => {

    /**
     * Start temporary MongoDB
     */

    mongoServer =
      await MongoMemoryServer.create();

    /**
     * Connection URI
     */

    const mongoUri =
      mongoServer.getUri();

    /**
     * Connect Mongoose
     */

    await mongoose.connect(
      mongoUri
    );
  };

/**
 * --------------------------------------------------
 * Clear Test Database
 * --------------------------------------------------
 *
 * Removes every document
 * from every collection.
 *
 * Executed before each test
 * to guarantee isolation.
 */

export const clearTestDatabase =
  async () => {

    /**
     * Get every collection
     */

    const collections =
      mongoose.connection.collections;

    /**
     * Delete documents
     */

    for (
      const collection of
      Object.values(collections)
    ) {

      await collection.deleteMany({});
    }
  };

/**
 * --------------------------------------------------
 * Disconnect Test Database
 * --------------------------------------------------
 *
 * Responsibilities:
 *
 * • Close Mongoose connection
 * • Stop Mongo Memory Server
 */

export const disconnectTestDatabase =
  async () => {

    /**
     * Close Mongoose
     */

    await mongoose.disconnect();

    /**
     * Stop MongoDB Memory Server
     */

    if (mongoServer) {

      await mongoServer.stop();
    }
  };