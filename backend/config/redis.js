import logger from "../utils/logger.js";
import {
  createRedisConnection,
  getRedisConnectionSummary,
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

let redisAvailable =
  false;

logger.info(
  "Redis connection configuration loaded",
  getRedisConnectionSummary()
);

//Connection Events

//Fired when redis connection
//is established successfully

redis.on("connect", () => {
  logger.info(
    "Redis connected successfully"
  );
});

redis.on("ready", () => {
  redisAvailable = true;
});

//Fired when Redis encounters
//A connection error
redis.on("error", (error) => {
  redisAvailable = false;

  logger.error(
    "Redis connection error",
    {
      message:
        error.message,
    }
  );
});

redis.on("end", () => {
  redisAvailable = false;
});

export const verifyRedisConnection =
  async () => {
    try {
      await redis.ping();
      redisAvailable = true;
      process.env.REDIS_RUNTIME_AVAILABLE = "true";
      return true;
    } catch (error) {
      redisAvailable = false;
      process.env.REDIS_RUNTIME_AVAILABLE = "false";

      logger.warn(
        "Redis ping failed; backend will start with Redis-dependent features limited",
        {
          message:
            error.message,
        }
      );

      return false;
    }
  };

export const isRedisAvailable = () =>
  redisAvailable;

export const redisClient =
  redis;

//Export reusable client
export default redis;
