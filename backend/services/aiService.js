/**
 * AI Service
 *
 * Responsibilities:
 * - Generate analytics insights
 * - Generate AI chat responses
 * - Support text + image chat
 * - Use smart model router
 * - Track model success/failure in Redis
 * - Apply timeout protection
 * - Avoid slow linear fallback through all models
 */

import { AI_ROUTER_CONFIG } from "../config/aiModels.js";
import { getBestModelsForRequest } from "./modelSelectorService.js";
import {
  markModelSuccess,
  markModelFailure,
} from "./modelHealthService.js";

const SAFE_AI_ERROR_MESSAGE = "AI is currently busy, please try again";
const MAX_MODEL_RETRIES = 1;
const RETRY_DELAY_MS = 500;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extract safe backend-only provider error.
 */
const extractOpenRouterError = (data) => {
  return (
    data?.error?.metadata?.raw ||
    data?.error?.message ||
    "Unknown AI provider error"
  );
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

    return content.trim();
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
 * Retry one selected model.
 *
 * Important:
 * We keep retry low because trying too many retries increases latency.
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
 * Smart fallback using best healthy models only.
 *
 * Flow:
 * - Select best 3 models from router
 * - Try first healthy model
 * - If failed, mark failure in Redis
 * - Try next selected model
 * - If all fail, return safe message
 */
const trySmartModelsWithFallback = async ({
  messages,
  needsVision = false,
  temperature = 0.5,
  maxTokens = 500,
}) => {
  const selectedModels = await getBestModelsForRequest({
    needsVision,
    maxModels: AI_ROUTER_CONFIG.maxModelsPerRequest,
  });

  if (!selectedModels.length) {
    console.error("[AI_NO_HEALTHY_MODELS]", {
      needsVision,
      timestamp: new Date().toISOString(),
    });

    return SAFE_AI_ERROR_MESSAGE;
  }

  console.log("[AI_SELECTED_MODELS]", {
    models: selectedModels.map((model) => ({
      id: model.id,
      score: model.score,
      avgLatencyMs: model.health?.avgLatencyMs,
      failures: model.health?.failures,
    })),
    needsVision,
  });

  for (const model of selectedModels) {
    try {
      return await tryModelWithRetry({
        model,
        messages,
        temperature,
        maxTokens,
      });
    } catch {
      continue;
    }
  }

  console.error("[AI_ALL_SELECTED_MODELS_FAILED]", {
    totalModelsTried: selectedModels.length,
    timestamp: new Date().toISOString(),
  });

  return SAFE_AI_ERROR_MESSAGE;
};

/**
 * Generate AI insights for dashboard analytics.
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

    return await trySmartModelsWithFallback({
      messages,
      needsVision: false,
      temperature: 0.5,
      maxTokens: 700,
    });
  } catch (error) {
    console.error("[AI_SERVICE_INSIGHTS_ERROR]", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });

    return SAFE_AI_ERROR_MESSAGE;
  }
};

/**
 * Generate AI chat response.
 *
 * Supports:
 * - text-only chat
 * - image-only chat
 * - text + image chat
 * - chat history context
 * - analytics context
 */
export const generateAnalyticsResponse = async ({
  analyticsContext,
  historyMessages = [],
  latestUserMessage,
  imageBase64 = null,
  imageMimeType = null,
}) => {
  try {
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
- If the image appears to be a post, thumbnail, profile, design, chart, or analytics screenshot, explain what is visible and give useful improvement suggestions
- Avoid claiming details that are not visible in the image
- Avoid repetition
- Keep answers polished and practical

Formatting rules:
- Prefer natural assistant-style responses
- Use headings only when needed
- Use bullets only when helpful
- Avoid random decorative titles
- Avoid one long raw paragraph when the answer is complex
- For very short questions like "hi", "hello", or "how are you", respond briefly

Analytics context:
${analyticsContext}
`;

    const hasImage = Boolean(imageBase64 && imageMimeType);

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
      temperature: 0.6,
      maxTokens: 800,
    });
  } catch (error) {
    console.error("[AI_SERVICE_CHAT_ERROR]", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });

    return SAFE_AI_ERROR_MESSAGE;
  }
};