import {
  AI_ROUTER_CONFIG,
  getCandidateModels,
} from "../config/aiModels.js";

import {
  getModelHealth,
  isModelDisabled,
} from "./modelHealthService.js";

/**
 * Calculate model score.
 *
 * Lower score = better model.
 *
 * We combine:
 * - model priority
 * - average latency
 * - failure penalty
 *
 * This creates smart routing behavior.
 */
const calculateModelScore = (model, health) => {
  /**
   * Priority importance.
   *
   * Lower priority number = better model.
   *
   * Multiply strongly so priority matters a lot.
   */
  const priorityScore = model.priority * 1000;

  /**
   * Latency score.
   *
   * Faster models become preferred automatically.
   */
  const latencyScore = health.avgLatencyMs || 0;

  /**
   * Failure penalty.
   *
   * More failures = lower trust.
   */
  const failurePenalty = health.failures * 3000;

  /**
   * Final score.
   */
  return (
    priorityScore +
    latencyScore +
    failurePenalty
  );
};

/**
 * Get best models for current AI request.
 *
 * Example:
 * User uploads image
 * ↓
 * only vision models returned
 *
 * Example:
 * User sends text
 * ↓
 * only text models returned
 */
export const getBestModelsForRequest = async ({
  needsVision = false,

  /**
   * Maximum models returned.
   *
   * Prevents trying huge model lists.
   */
  maxModels = AI_ROUTER_CONFIG.maxModelsPerRequest,
} = {}) => {
  /**
   * Get candidate models from registry.
   */
  const candidates = getCandidateModels({
    needsVision,
  });

  const scoredModels = [];

  /**
   * Process each candidate model.
   */
  for (const model of candidates) {
    /**
     * Skip disabled models.
     *
     * Example:
     * model failed 3 times
     * ↓
     * temporarily disabled
     */
    const disabled = await isModelDisabled(
      model.id
    );

    if (disabled) {
      continue;
    }

    /**
     * Get Redis health data.
     */
    const health = await getModelHealth(
      model.id
    );

    /**
     * Calculate smart routing score.
     */
    const score = calculateModelScore(
      model,
      health
    );

    scoredModels.push({
      ...model,
      health,
      score,
    });
  }

  /**
   * Sort:
   * lower score = better model
   */
  const sortedModels = scoredModels.sort(
    (a, b) => a.score - b.score
  );

  /**
   * Return top healthy models only.
   *
   * Example:
   * if maxModels = 3
   * ↓
   * return best 3 models
   */
  return sortedModels.slice(0, maxModels);
};