import mongoose
  from "mongoose";

import logger
  from "../utils/logger.js";

/**
 * ---------------------------------------------------
 * MongoDB Connection
 * ---------------------------------------------------
 */

const connectDB =
  async () => {

    /**
     * Validate Mongo URI
     */

    if (
      !process.env.MONGO_URI
    ) {

      throw new Error(
        "MONGO_URI is required to start the backend"
      );
    }

    try {

      /**
       * Strict query mode
       *
       * Prevents unknown query fields
       */

      mongoose.set(

        "strictQuery",

        true
      );

      /**
       * Connect MongoDB
       */

      const conn =
        await mongoose.connect(

          process.env.MONGO_URI,

          {

            serverSelectionTimeoutMS:
              10000,
          }
        );

      logger.info(

        "MongoDB connected successfully",

        {

          host:
            conn.connection.host,

          database:
            conn.connection.name,
        }
      );

      /**
       * ---------------------------------------------------
       * Mongo Connection Events
       * ---------------------------------------------------
       */

      mongoose.connection.on(

        "disconnected",

        () => {

          logger.warn(
            "MongoDB disconnected"
          );
        }
      );

      mongoose.connection.on(

        "reconnected",

        () => {

          logger.info(
            "MongoDB reconnected"
          );
        }
      );

      mongoose.connection.on(

        "error",

        (error) => {

          logger.error(

            "MongoDB connection error",

            {

              message:
                error.message,
            }
          );
        }
      );

    } catch (error) {

      logger.error(

        "MongoDB connection failed",

        {

          message:
            error.message,

          stack:
            error.stack,
        }
      );

      throw error;
    }
  };

export default connectDB;