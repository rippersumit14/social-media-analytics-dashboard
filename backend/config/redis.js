import logger from "../utils/logger.js";
import {
  createRedisConnection,
} from "./redisConnection.js";

/**
 * Redis client config
 * 
 * purpose:
 * Central Redis connection used across
 * 
 * -OAuth state storage
 * -BullMQ queues
 * -Caching
 * -Rate limiting
 * 
 * why a single connection ?
 * 
 * Instead of creating a new Redis connection
 * in every service, we create one reusable
 * client and share it throughout the app.
 */

const redis =
  createRedisConnection({
    connectionName:
      "creator-growth-api",
  });

//Connection Events

//Fired when redis connection
//is established successfully

redis.on("connect", () => {
  logger.info(
    "Redis connected successfully"
  );
});

//Fired when Redis encounters
//A connection error
redis.on("error", (error) => {
  logger.error(
    "Redis connection error",
    {
      message:
        error.message,
    }
  );
});

//Export reusable client
export default redis;
