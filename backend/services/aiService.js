/**
 * AI Service
 *
 * Responsibilities:
 * - Generate analytics insights
 * - Generate AI chat responses
 * - Use smart model router
 * - Prefer session-selected model when available
 * - Track model success/failure in Redis
 * - Apply timeout protection
 * - Return model metadata to controller
 */

import {
  AI_MODELS,
  AI_ROUTER_CONFIG,
} from "../config/aiModels.js";

import { getBestModelsForRequest } from "./modelSelectorService.js";

import {
  isModelDisabled,
  markModelSuccess,
  markModelFailure,
} from "./modelHealthService.js";

const SAFE_AI_ERROR_MESSAGE = "AI is currently busy, please try again";

const MAX_MODEL_RETRIES = 1;
const RETRY_DELAY_MS = 500;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extract useful OpenRouter error for backend logs only.
 */
const extractOpenRouterError = (data) => {
  return (
    data?.error?.metadata?.raw ||
    data?.error?.message ||
    "Unknown AI provider error"
  );
};

/**
 * Find model config by model id.
 */
const findModelById = (modelId) => {
  if (!modelId) return null;

  return AI_MODELS.find((model) => model.id === modelId) || null;
};

/**
 * Check if preferred session model can be used.
 */
const getUsablePreferredModel = async ({
  preferredModelId,
  needsVision,
}) => {
  const model = findModelById(preferredModelId);

  if (!model) return null;

  if (!model.enabled) return null;

  if (needsVision && !model.supportsVision) return null;

  const disabled = await isModelDisabled(model.id);

  if (disabled) return null;

  return model;
};

/**
 * Calls one OpenRouter model with timeout protection.
 */
const callOpenRouterModel = async ({
  model,
  messages,
  temperature = 0.5,
  maxTokens = 500,
}) => {
  const timeoutMs = model.timeoutMs || AI_ROUTER_CONFIG.defaultTimeoutMs;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const startTime = Date.now();

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.APP_PUBLIC_URL || "http://localhost:5173",
          "X-Title": "Social Media Analytics SaaS",
        },
        body: JSON.stringify({
          model: model.id,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(extractOpenRouterError(data));
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      throw new Error("No usable response text returned by model");
    }

    const latencyMs = Date.now() - startTime;

    await markModelSuccess(model.id, latencyMs);

    console.log("[AI_MODEL_SUCCESS]", {
      model: model.id,
      latencyMs,
      timestamp: new Date().toISOString(),
    });

    return {
      content: content.trim(),
      modelUsed: model.id,
      modelName: model.name,
      latencyMs,
    };
  } catch (error) {
    await markModelFailure(model.id);

    console.error("[AI_MODEL_FAILED]", {
      model: model.id,
      message:
        error.name === "AbortError"
          ? `Model timed out after ${timeoutMs}ms`
          : error.message,
      timestamp: new Date().toISOString(),
    });

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Retry one model.
 *
 * Keep retries low because retries increase response time.
 */
const tryModelWithRetry = async ({
  model,
  messages,
  temperature,
  maxTokens,
}) => {
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_MODEL_RETRIES; attempt++) {
    try {
      return await callOpenRouterModel({
        model,
        messages,
        temperature,
        maxTokens,
      });
    } catch (error) {
      lastError = error;

      if (attempt < MAX_MODEL_RETRIES) {
        await wait(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError;
};

/**
 * Build final model list.
 *
 * Logic:
 * 1. If session already has selected model, try it first.
 * 2. Then add router-selected backup models.
 * 3. Remove duplicates.
 */
const buildModelExecutionList = async ({
  needsVision = false,
  preferredModelId = null,
}) => {
  const selectedModels = await getBestModelsForRequest({
    needsVision,
    maxModels: AI_ROUTER_CONFIG.maxModelsPerRequest,
  });

  const preferredModel = await getUsablePreferredModel({
    preferredModelId,
    needsVision,
  });

  const finalModels = [];

  if (preferredModel) {
    finalModels.push(preferredModel);
  }

  for (const model of selectedModels) {
    const alreadyAdded = finalModels.some(
      (existingModel) => existingModel.id === model.id
    );

    if (!alreadyAdded) {
      finalModels.push(model);
    }
  }

  return finalModels;
};

/**
 * Smart fallback system.
 *
 * Uses:
 * - session preferred model first
 * - Redis health-aware model selector
 * - timeout protection
 * - circuit breaker through markModelFailure
 */
const trySmartModelsWithFallback = async ({
  messages,
  needsVision = false,
  preferredModelId = null,
  temperature = 0.5,
  maxTokens = 500,
}) => {
  const modelsToTry = await buildModelExecutionList({
    needsVision,
    preferredModelId,
  });

  if (!modelsToTry.length) {
    console.error("[AI_NO_AVAILABLE_MODELS]", {
      needsVision,
      preferredModelId,
      timestamp: new Date().toISOString(),
    });

    return {
      reply: SAFE_AI_ERROR_MESSAGE,
      modelUsed: null,
      modelName: null,
      failed: true,
    };
  }

  console.log("[AI_SELECTED_MODELS]", {
    preferredModelId,
    models: modelsToTry.map((model) => ({
      id: model.id,
      name: model.name,
      priority: model.priority,
    })),
    needsVision,
  });

  for (const model of modelsToTry) {
    try {
      const result = await tryModelWithRetry({
        model,
        messages,
        temperature,
        maxTokens,
      });

      return {
        reply: result.content,
        modelUsed: result.modelUsed,
        modelName: result.modelName,
        latencyMs: result.latencyMs,
        failed: false,
      };
    } catch {
      continue;
    }
  }

  console.error("[AI_ALL_SELECTED_MODELS_FAILED]", {
    totalModelsTried: modelsToTry.length,
    timestamp: new Date().toISOString(),
  });

  return {
    reply: SAFE_AI_ERROR_MESSAGE,
    modelUsed: null,
    modelName: null,
    failed: true,
  };
};

/**
 * Generate AI insights for dashboard analytics.
 *
 * Kept as string return because existing insights controller expects text.
 */
export const generateAnalyticsInsights = async (
  socialAccount,
  snapshots,
  customPrompt = null
) => {
  try {
    if ((!snapshots || snapshots.length === 0) && !customPrompt) {
      return "No analytics data available. Please sync your account first.";
    }

    const first = snapshots?.[0] || null;
    const latest = snapshots?.[snapshots.length - 1] || null;

    const defaultPrompt = `
You are a professional social media analytics expert.

Your job:
- Analyze account performance clearly
- Provide structured, informative, professional output
- Focus on growth, engagement, content performance, and actionable recommendations
- Do not use emojis
- Do not sound casual or childish
- Avoid one long paragraph
- Keep the response polished and readable

Required structure:

Performance Breakdown
- Summarize current performance using the available data
- Mention important metric movement where relevant

Key Findings
- Explain the most important growth or performance signals
- Highlight what appears to be helping or hurting growth

Recommended Actions
- Give practical, high-value next steps
- Keep them specific and useful

Rules:
- Use professional headings
- Use bullet points where useful
- Be analytical but easy to understand
- Mention percentages or metric changes when relevant

Account:
- Username: ${socialAccount?.username || "Unknown"}
- Platform: ${socialAccount?.platform || "Unknown"}

${
  first && latest
    ? `
First Snapshot:
- Followers: ${first.followers}
- Following: ${first.following}
- Posts: ${first.posts}
- Likes: ${first.likes}
- Comments: ${first.comments}
- Engagement Rate: ${first.engagementRate}
- Impressions: ${first.impressions}
- Reach: ${first.reach}

Latest Snapshot:
- Followers: ${latest.followers}
- Following: ${latest.following}
- Posts: ${latest.posts}
- Likes: ${latest.likes}
- Comments: ${latest.comments}
- Engagement Rate: ${latest.engagementRate}
- Impressions: ${latest.impressions}
- Reach: ${latest.reach}

Change Summary:
- Follower change: ${(latest.followers ?? 0) - (first.followers ?? 0)}
- Engagement rate change: ${(
        (latest.engagementRate ?? 0) - (first.engagementRate ?? 0)
      ).toFixed(2)}
- Post change: ${(latest.posts ?? 0) - (first.posts ?? 0)}
- Likes change: ${(latest.likes ?? 0) - (first.likes ?? 0)}
- Comments change: ${(latest.comments ?? 0) - (first.comments ?? 0)}
`
    : `
No detailed analytics snapshots are available yet.
`
}

Generate a professional structured response now.
`;

    const prompt = customPrompt || defaultPrompt;

    const messages = [
      {
        role: "user",
        content: prompt,
      },
    ];

    const result = await trySmartModelsWithFallback({
      messages,
      needsVision: false,
      temperature: 0.5,
      maxTokens: 700,
    });

    return result.reply;
  } catch (error) {
    console.error("[AI_SERVICE_INSIGHTS_ERROR]", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });

    return SAFE_AI_ERROR_MESSAGE;
  }
};

/**
 * Generate normal non-streaming AI chat response.
 *
 * Used by existing POST /api/ai/chat/:socialAccountId route.
 *
 * Time Complexity:
 * O(m) where m = number of context messages sent to model
 *
 * Space Complexity:
 * O(m) because prompt messages are built in memory
 */
export const generateAnalyticsResponse = async ({
  analyticsContext,
  historyMessages = [],
  latestUserMessage,
  imageBase64 = null,
  imageMimeType = null,
  preferredModelId = null,
}) => {
  try {
    const hasImage = Boolean(imageBase64 && imageMimeType);

    const systemPrompt = `
You are a professional AI assistant inside a social media analytics platform.

Your behavior:
- Be natural, intelligent, and conversational
- Sound like a serious assistant, not a reporting bot
- Do not use emojis
- Do not act childish or overly casual
- Do not always turn every response into an analytics report
- Answer according to the user's actual question
- Keep greetings short and natural
- Use account analytics only when relevant
- If the user asks about performance, use analytics context
- If the user asks strategy/content questions, act like a social media growth expert
- If the user uploads an image, analyze the visual content clearly and practically
- Avoid claiming details that are not visible in the image
- Avoid repetition
- Keep answers polished and practical

Formatting rules:
- Prefer natural assistant-style responses
- Use headings only when needed
- Use bullets only when helpful
- Avoid random decorative titles
- Avoid one long raw paragraph when the answer is complex

Analytics context:
${analyticsContext}
`;

    const userContent = hasImage
      ? [
          {
            type: "text",
            text:
              latestUserMessage ||
              "Please analyze this uploaded image in the context of social media growth.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${imageMimeType};base64,${imageBase64}`,
            },
          },
        ]
      : latestUserMessage;

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...historyMessages,
      {
        role: "user",
        content: userContent,
      },
    ];

    return await trySmartModelsWithFallback({
      messages,
      needsVision: hasImage,
      preferredModelId,
      temperature: 0.6,
      maxTokens: 800,
    });
  } catch (error) {
    console.error("[AI_SERVICE_CHAT_ERROR]", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });

    return {
      reply: SAFE_AI_ERROR_MESSAGE,
      modelUsed: null,
      modelName: null,
      latencyMs: null,
      failed: true,
    };
  }
};


/**
 * Generate AI chat response using streaming.
 *
 * Used for ChatGPT-like typing UI.
 *
 * Time Complexity:
 * O(n) where n = total streamed characters/tokens
 *
 * Space Complexity:
 * O(n) because we collect final text to save in MongoDB
 */
export const generateAnalyticsResponseStream = async ({
  analyticsContext,
  historyMessages = [],
  latestUserMessage,
  imageBase64 = null,
  imageMimeType = null,
  preferredModelId = null,
  onChunk,
  onModelSelected,
}) => {
  const hasImage = Boolean(imageBase64 && imageMimeType);

  const systemPrompt = `
You are a professional AI assistant inside a social media analytics platform.

Behavior:
- Be natural, intelligent, and conversational
- Do not use emojis
- Do not act childish
- Use account analytics only when relevant
- If user asks strategy/content questions, act like a growth expert
- If image is uploaded, analyze it practically
- Keep answers polished and useful

Analytics context:
${analyticsContext}
`;

  const userContent = hasImage
    ? [
        {
          type: "text",
          text:
            latestUserMessage ||
            "Please analyze this uploaded image in the context of social media growth.",
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${imageMimeType};base64,${imageBase64}`,
          },
        },
      ]
    : latestUserMessage;

  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    ...historyMessages,
    {
      role: "user",
      content: userContent,
    },
  ];

  const modelsToTry = await buildModelExecutionList({
    needsVision: hasImage,
    preferredModelId,
  });

  if (!modelsToTry.length) {
    return {
      reply: SAFE_AI_ERROR_MESSAGE,
      modelUsed: null,
      modelName: null,
      failed: true,
    };
  }

  for (const model of modelsToTry) {
    const timeoutMs = model.timeoutMs || AI_ROUTER_CONFIG.defaultTimeoutMs;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const startTime = Date.now();
    let finalText = "";

    try {
      onModelSelected?.({
        modelUsed: model.id,
        modelName: model.name,
      });

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer":
              process.env.APP_PUBLIC_URL || "http://localhost:5173",
            "X-Title": "Social Media Analytics SaaS",
          },
          body: JSON.stringify({
            model: model.id,
            messages,
            temperature: 0.6,
            max_tokens: 800,
            stream: true,
          }),
        }
      );

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        throw new Error(extractOpenRouterError(data));
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const rawChunk = decoder.decode(value, { stream: true });
        const lines = rawChunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const data = line.replace("data:", "").trim();

          if (!data || data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const chunk =
              parsed?.choices?.[0]?.delta?.content ||
              parsed?.choices?.[0]?.message?.content ||
              "";

            if (chunk) {
              finalText += chunk;
              onChunk?.(chunk);
            }
          } catch {
            continue;
          }
        }
      }

      if (!finalText.trim()) {
        throw new Error("No streamed content returned by model");
      }

      const latencyMs = Date.now() - startTime;

      await markModelSuccess(model.id, latencyMs);

      return {
        reply: finalText.trim(),
        modelUsed: model.id,
        modelName: model.name,
        latencyMs,
        failed: false,
      };
    } catch (error) {
      await markModelFailure(model.id);

      console.error("[AI_STREAM_MODEL_FAILED]", {
        model: model.id,
        message:
          error.name === "AbortError"
            ? `Model timed out after ${timeoutMs}ms`
            : error.message,
        timestamp: new Date().toISOString(),
      });

      continue;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    reply: SAFE_AI_ERROR_MESSAGE,
    modelUsed: null,
    modelName: null,
    failed: true,
  };
};