import Redis from "ioredis";

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

const redis = new Redis(
  process.env.REDIS_URL
);

//Connection Events

//Fired when redis connection
//is established successfully

redis.on("connect", () => {
  console.log(
    "Redis connected successfully"
  );
});

//Fired when Redis encounters
//A connection error
redis.on("error", (error) => {
  console.error(
    "Redis connection error:",
    error.message
  );
});

//Export reusable client
export default redis;
