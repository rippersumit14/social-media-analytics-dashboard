import IORedis from "ioredis";

/**
 * Redis connection
 *
 * Used for:
 * - BullMQ queues
 * - model health tracking
 * - circuit breaker state
 *
 * Important:
 * BullMQ docs warn not to use ioredis keyPrefix option.
 * BullMQ manages its own prefix internally.
 */

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const redisConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

/**
 * Separate Redis client for normal app reads/writes.
 * This avoids mixing queue operations and app metadata operations.
 */
export const redisClient = new IORedis(redisUrl, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

redisConnection.on("connect", () => {
  console.log("Redis queue connection established");
});

redisClient.on("connect", () => {
  console.log("Redis app client connected");
});

redisConnection.on("error", (error) => {
  console.error("[REDIS_QUEUE_ERROR]", error.message);
});

redisClient.on("error", (error) => {
  console.error("[REDIS_CLIENT_ERROR]", error.message);
});