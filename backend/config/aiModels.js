/**
 * config/aiModels.js
 *
 * Production-safe AI model registry.
 *
 * IMPORTANT:
 * We use:
 * - curated text models
 * - curated vision models
 * - capability routing
 *
 * NOT random unstable models.
 */

/**
 * TEXT MODELS
 *
 * Used for:
 * - normal AI chat
 * - analytics
 * - summaries
 * - recommendations
 */
export const TEXT_MODELS = [
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek Chat V3",
    provider: "openrouter",
    supportsVision: false,
  },

  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B",
    provider: "openrouter",
    supportsVision: false,
  },

  {
    id: "mistralai/mistral-7b-instruct:free",
    name: "Mistral 7B",
    provider: "openrouter",
    supportsVision: false,
  },

  {
    id: "qwen/qwen-2.5-72b-instruct:free",
    name: "Qwen 72B",
    provider: "openrouter",
    supportsVision: false,
  },

  {
    id: "google/gemma-2-9b-it:free",
    name: "Gemma 2 9B",
    provider: "openrouter",
    supportsVision: false,
  },

  {
    id: "nousresearch/hermes-3-llama-3.1-405b:free",
    name: "Hermes 3",
    provider: "openrouter",
    supportsVision: false,
  },

  {
    id: "openchat/openchat-7b:free",
    name: "OpenChat 7B",
    provider: "openrouter",
    supportsVision: false,
  },

  {
    id: "gryphe/mythomax-l2-13b:free",
    name: "MythoMax",
    provider: "openrouter",
    supportsVision: false,
  },

  {
    id: "undi95/toppy-m-7b:free",
    name: "Toppy M 7B",
    provider: "openrouter",
    supportsVision: false,
  },

  {
    id: "teknium/openhermes-2.5-mistral-7b:free",
    name: "OpenHermes",
    provider: "openrouter",
    supportsVision: false,
  },
];

/**
 * VISION MODELS
 *
 * IMPORTANT:
 * ONLY verified multimodal models.
 */
export const VISION_MODELS = [
  {
    id: "qwen/qwen2-vl-72b-instruct:free",
    name: "Qwen VL",
    provider: "openrouter",
    supportsVision: true,
  },

  {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Gemini Flash Vision",
    provider: "openrouter",
    supportsVision: true,
  },

  {
    id: "llava-hf/llava-1.5-7b-hf",
    name: "LLaVA 1.5",
    provider: "openrouter",
    supportsVision: true,
  },

  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openrouter",
    supportsVision: true,
  },
];

/**
 * Unified export.
 */
export const AI_MODELS = {
  TEXT_MODELS,
  VISION_MODELS,
};

/**
 * AI router configuration.
 */
export const AI_ROUTER_CONFIG = {
  /**
   * Request timeout.
   */
  defaultTimeoutMs: 45000,

  /**
   * Max models tried per request.
   */
  maxModelsPerRequest: 5,

  /**
   * Failed model cooldown.
   */
  disableDurationMs: 5 * 60 * 1000,
};