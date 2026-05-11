import { redisClient } from "../config/redis.js";
import { AI_ROUTER_CONFIG } from "../config/aiModels.js";

const MODEL_HEALTH_PREFIX = "ai:model-health:";

const getModelHealthKey = (modelId) => {
  return `${MODEL_HEALTH_PREFIX}${modelId}`;
};

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

export const getModelHealth = async (modelId) => {
  const key = getModelHealthKey(modelId);
  const data = await redisClient.get(key);

  if (!data) {
    return getDefaultHealth();
  }

  try {
    return {
      ...getDefaultHealth(),
      ...JSON.parse(data),
    };
  } catch {
    return getDefaultHealth();
  }
};

export const saveModelHealth = async (modelId, health) => {
  const key = getModelHealthKey(modelId);

  await redisClient.set(key, JSON.stringify(health));
};

export const isModelDisabled = async (modelId) => {
  const health = await getModelHealth(modelId);

  if (!health.disabledUntil) {
    return false;
  }

  const now = Date.now();
  const disabledUntilTime = new Date(health.disabledUntil).getTime();

  if (now >= disabledUntilTime) {
    health.disabledUntil = null;
    health.failures = 0;

    await saveModelHealth(modelId, health);

    return false;
  }

  return true;
};

export const markModelSuccess = async (modelId, latencyMs) => {
  const health = await getModelHealth(modelId);

  health.failures = 0;
  health.successCount += 1;
  health.totalLatencyMs += latencyMs;

  health.avgLatencyMs = Math.round(
    health.totalLatencyMs / health.successCount
  );

  health.disabledUntil = null;
  health.lastSuccessAt = new Date().toISOString();

  await saveModelHealth(modelId, health);
};

export const markModelFailure = async (modelId) => {
  const health = await getModelHealth(modelId);

  health.failures += 1;
  health.lastFailureAt = new Date().toISOString();

  if (health.failures >= AI_ROUTER_CONFIG.failureThreshold) {
    health.disabledUntil = new Date(
      Date.now() + AI_ROUTER_CONFIG.circuitBreakerCooldownMs
    ).toISOString();
  }

  await saveModelHealth(modelId, health);
};

export const getModelHealthSnapshot = async () => {
  const keys = await redisClient.keys(`${MODEL_HEALTH_PREFIX}*`);
  const snapshot = {};

  for (const key of keys) {
    const modelId = key.replace(MODEL_HEALTH_PREFIX, "");
    const data = await redisClient.get(key);

    snapshot[modelId] = data ? JSON.parse(data) : getDefaultHealth();
  }

  return snapshot;
};

export const resetModelHealth = async () => {
  const keys = await redisClient.keys(`${MODEL_HEALTH_PREFIX}*`);

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};