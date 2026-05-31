import { redisClient } from "../config/redis.js";
import { AI_ROUTER_CONFIG } from "../config/aiModels.js";

// Prefix for storing model health data inside Redis
const MODEL_HEALTH_PREFIX = "ai:model-health:";

// Generate Redis key for a specific model
const getModelHealthKey = (modelId) => {
  return `${MODEL_HEALTH_PREFIX}${modelId}`;
};

// Default health structure for every model
const getDefaultHealth = () => {
  return {
    failures: 0,
    successCount: 0,
    totalLatencyMs: 0,
    avgLatencyMs: null,
    disabledUntil: null,
    lastSuccessAt: null,
    lastFailureAt: null,
  };
};

// Get health data of a specific AI model from Redis
export const getModelHealth = async (modelId) => {
  const key = getModelHealthKey(modelId);

  // Fetch data from Redis
  const data = await redisClient.get(key);

  // If no data exists, return default health
  if (!data) {
    return getDefaultHealth();
  }

  try {
    // Merge stored data with default structure
    return {
      ...getDefaultHealth(),
      ...JSON.parse(data),
    };
  } catch {
    // If JSON parsing fails, return default health
    return getDefaultHealth();
  }
};

// Save model health data into Redis
export const saveModelHealth = async (modelId, health) => {
  const key = getModelHealthKey(modelId);

  await redisClient.set(key, JSON.stringify(health));
};

// Check whether a model is currently disabled
export const isModelDisabled = async (modelId) => {
  const health = await getModelHealth(modelId);

  // If disabledUntil is null, model is active
  if (!health.disabledUntil) {
    return false;
  }

  const now = Date.now();
  const disabledUntilTime = new Date(health.disabledUntil).getTime();

  // Cooldown completed -> re-enable model
  if (now >= disabledUntilTime) {
    health.disabledUntil = null;
    health.failures = 0;

    await saveModelHealth(modelId, health);

    return false;
  }

  // Model still disabled
  return true;
};

// Mark successful AI model response
export const markModelSuccess = async (modelId, latencyMs) => {
  const health = await getModelHealth(modelId);

  // Reset failures on success
  health.failures = 0;

  // Increment successful response count
  health.successCount += 1;

  // Add current response latency
  health.totalLatencyMs += latencyMs;

  // Calculate average latency
  health.avgLatencyMs = Math.round(
    health.totalLatencyMs / health.successCount
  );

  // Remove disabled state if previously disabled
  health.disabledUntil = null;

  // Save last success timestamp
  health.lastSuccessAt = new Date().toISOString();

  await saveModelHealth(modelId, health);
};

// Mark failed AI model response
export const markModelFailure = async (modelId) => {
  const health = await getModelHealth(modelId);

  // Increase failure count
  health.failures += 1;

  // Save failure timestamp
  health.lastFailureAt = new Date().toISOString();

  // Disable model if failures cross threshold
  if (health.failures >= AI_ROUTER_CONFIG.failureThreshold) {
    health.disabledUntil = new Date(
      Date.now() + AI_ROUTER_CONFIG.circuitBreakerCooldownMs
    ).toISOString();
  }

  await saveModelHealth(modelId, health);
};

// Get health snapshot of all AI models
export const getModelHealthSnapshot = async () => {
  const keys = await redisClient.keys(`${MODEL_HEALTH_PREFIX}*`);

  const snapshot = {};

  for (const key of keys) {
    const modelId = key.replace(MODEL_HEALTH_PREFIX, "");

    const data = await redisClient.get(key);

    snapshot[modelId] = data
      ? JSON.parse(data)
      : getDefaultHealth();
  }

  return snapshot;
};

// Reset health data of all models
export const resetModelHealth = async () => {
  const keys = await redisClient.keys(`${MODEL_HEALTH_PREFIX}*`);

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};