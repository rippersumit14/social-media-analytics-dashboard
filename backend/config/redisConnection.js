import Redis from "ioredis";

const stripWrappingQuotes = (value) => {
  const trimmedValue =
    String(value || "").trim();

  if (
    (trimmedValue.startsWith("\"") && trimmedValue.endsWith("\"")) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
  ) {
    return trimmedValue.slice(1, -1).trim();
  }

  return trimmedValue;
};

export const getRedisUrl = () =>
  stripWrappingQuotes(process.env.REDIS_URL);

export const assertRedisUrl = () => {
  const redisUrl =
    getRedisUrl();

  if (!redisUrl) {
    throw new Error("REDIS_URL is required");
  }

  if (
    redisUrl.startsWith("http://") ||
    redisUrl.startsWith("https://")
  ) {
    throw new Error(
      "REDIS_URL must be the Upstash Redis TCP URL, not the REST URL. Use redis:// or rediss://."
    );
  }

  return redisUrl;
};

export const createRedisConnection = (options = {}) => {
  const redisUrl =
    assertRedisUrl();

  return new Redis(redisUrl, {
    connectTimeout:
      10000,
    enableReadyCheck:
      false,
    lazyConnect:
      false,
    ...options,
    tls:
      redisUrl.startsWith("rediss://")
        ? {
          servername:
            new URL(redisUrl).hostname,
          ...options.tls,
        }
        : options.tls,
  });
};
