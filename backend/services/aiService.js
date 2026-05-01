/**
 * AI Service
 *
 * Responsibilities:
 * 1. Generate analytics insights from account snapshots
 * 2. Generate AI chat responses with optional image analysis
 * 3. Provide a reliability layer:
 *    - retry failed model calls
 *    - fallback to next model
 *    - hide raw provider errors from frontend
 *    - log backend-only debugging details
 */

const AI_MODELS = [
  "inclusionai/ling-2.6-flash:free",
  "nvidia/nemotron-3-super:free",
  "z-ai/glm-4.5-air:free",
  "openai/gpt-oss-120b:free",
  "google/gemma-4-31b:free",
  "google/gemma-4-26b-a4b:free",
  "openai/gpt-oss-20b:free",
];

/**
 * Vision-capable models for image-based AI chat.
 * These are used only when the user uploads an image.
 */
const VISION_MODELS = [
  "qwen/qwen2.5-vl-72b-instruct:free",
  "qwen/qwen2.5-vl-32b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
  "google/gemma-3-27b-it:free",
  "openrouter/free",
];

/**
 * Reliability configuration
 */
const MAX_MODEL_RETRIES = 2;
const RETRY_DELAY_MS = 600;
const SAFE_AI_ERROR_MESSAGE = "AI is currently busy, please try again";

/**
 * Small delay helper used between retry attempts.
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extracts useful provider error details for backend logs only.
 * This error should never be directly sent to the frontend.
 */
const extractOpenRouterError = (data) => {
  return (
    data?.error?.metadata?.raw ||
    data?.error?.message ||
    "Unknown AI provider error"
  );
};

/**
 * Backend-only model failure logger.
 */
const logModelFailure = ({ model, attempt, error }) => {
  console.error("[AI_MODEL_FAILED]", {
    model,
    attempt,
    message: error?.message || "Unknown AI error",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Calls a single OpenRouter model once.
 */
const callOpenRouterModel = async ({
  model,
  messages,
  temperature = 0.5,
  maxTokens = 500,
}) => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(extractOpenRouterError(data));
  }

  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("No usable response text returned by model");
  }

  return content.trim();
};

/**
 * Retries the same model before moving to another model.
 */
const trySingleModelWithRetry = async ({
  model,
  messages,
  temperature = 0.5,
  maxTokens = 500,
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

      logModelFailure({
        model,
        attempt,
        error,
      });

      if (attempt < MAX_MODEL_RETRIES) {
        await wait(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError;
};

/**
 * Smart fallback system.
 *
 * Flow:
 * 1. Try first model
 * 2. Retry same model if it fails
 * 3. Move to next model if retries fail
 * 4. Return safe fallback message if all models fail
 */
const tryModelsWithFallback = async ({
  models = AI_MODELS,
  messages,
  temperature = 0.5,
  maxTokens = 500,
}) => {
  for (const model of models) {
    try {
      const result = await trySingleModelWithRetry({
        model,
        messages,
        temperature,
        maxTokens,
      });

      console.log("[AI_MODEL_SUCCESS]", {
        model,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch {
      continue;
    }
  }

  console.error("[AI_ALL_MODELS_FAILED]", {
    totalModelsTried: models.length,
    timestamp: new Date().toISOString(),
  });

  return SAFE_AI_ERROR_MESSAGE;
};

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

    return await tryModelsWithFallback({
      models: AI_MODELS,
      messages,
      temperature: 0.5,
      maxTokens: 700,
    });
  } catch (error) {
    console.error("AI Service Error (Insights):", error.message);
    return SAFE_AI_ERROR_MESSAGE;
  }
};

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
            text: latestUserMessage,
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

    return await tryModelsWithFallback({
      models: hasImage ? VISION_MODELS : AI_MODELS,
      messages,
      temperature: 0.6,
      maxTokens: 800,
    });
  } catch (error) {
    console.error("AI Service Error (Chat):", error.message);
    return SAFE_AI_ERROR_MESSAGE;
  }
};