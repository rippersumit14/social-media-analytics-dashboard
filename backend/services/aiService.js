import Groq from "groq-sdk";

import { extractTextFromImage } from "./ocrService.js";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const MAX_IMAGE_CONTEXT = 3000;
const MAX_HISTORY_MESSAGES = 20;

let groqClient = null;

/**
 * Lazily create the Groq client when AI is actually used.
 *
 * This keeps auth, OAuth, and dashboard routes bootable while provider keys
 * are still being configured, and the AI route can return a clean fallback.
 */
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is required for AI responses");
  }

  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  return groqClient;
};

const buildSystemPrompt = (analyticsContext = "") => {
  return `
You are a professional AI assistant inside a creator analytics SaaS platform.

Style:
- professional
- concise
- strategic
- practical
- conversational

Responsibilities:
- analyze social media performance
- analyze OCR text extracted from screenshots
- explain analytics metrics clearly
- suggest creator growth strategies
- provide actionable recommendations

Analytics Context:
${analyticsContext}
`;
};

const buildHistoryText = (historyMessages = []) => {
  return historyMessages
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");
};

const buildOCRContext = (extractedText) => {
  if (!extractedText) {
    return "";
  }

  return `
OCR Extracted From Uploaded Image:
${extractedText.slice(0, MAX_IMAGE_CONTEXT)}

Use the OCR text as screenshot context. If OCR is incomplete, say what can and
cannot be inferred instead of pretending to see details that are not present.
`;
};

const buildFinalPrompt = ({
  analyticsContext,
  historyMessages,
  latestUserMessage,
  extractedOCRText,
}) => {
  return `
${buildSystemPrompt(analyticsContext)}

Conversation History:
${buildHistoryText(historyMessages)}

${buildOCRContext(extractedOCRText)}

Latest User Message:
${latestUserMessage}

Provide a clear answer with useful insights and practical next actions.
`;
};

const generateGroqResponse = async ({ finalPrompt }) => {
  const completion = await getGroqClient().chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "user",
        content: finalPrompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  });

  return completion.choices?.[0]?.message?.content || "No response generated.";
};

const extractOCRContext = async (imageBase64) => {
  if (!imageBase64) {
    return "";
  }

  try {
    const imageBuffer = Buffer.from(imageBase64, "base64");
    const extractedText = await extractTextFromImage(imageBuffer);

    console.log("[OCR_TEXT_EXTRACTED]", {
      length: extractedText.length,
    });

    return extractedText;
  } catch (error) {
    /**
     * OCR should not take down chat. The model can still answer using the
     * user's text and analytics context.
     */
    console.error("[OCR_PIPELINE_ERROR]", {
      message: error.message,
    });

    return "";
  }
};

export const generateAnalyticsResponse = async ({
  analyticsContext,
  historyMessages = [],
  latestUserMessage,
  imageBase64 = null,
}) => {
  const startTime = Date.now();

  try {
    const extractedOCRText = await extractOCRContext(imageBase64);

    const finalPrompt = buildFinalPrompt({
      analyticsContext,
      historyMessages,
      latestUserMessage,
      extractedOCRText,
    });

    const reply = await generateGroqResponse({
      finalPrompt,
    });

    return {
      reply,
      modelUsed: GROQ_MODEL,
      modelName: "Groq Llama 3.3",
      latencyMs: Date.now() - startTime,
      failed: false,
    };
  } catch (error) {
    console.error("[AI_RESPONSE_ERROR]", {
      message: error.message,
    });

    return {
      reply: "AI is currently busy, please try again.",
      modelUsed: "fallback",
      modelName: "Fallback",
      latencyMs: Date.now() - startTime,
      failed: true,
    };
  }
};

export const generateAnalyticsInsights = async (
  socialAccount,
  snapshots,
  customPrompt = null
) => {
  try {
    const latestSnapshot = snapshots?.[snapshots.length - 1] || {};

    const analyticsPrompt =
      customPrompt ||
      `
Analyze this social media account professionally.

Account:
- Username: ${socialAccount?.username}
- Platform: ${socialAccount?.platform}

Metrics:
- Followers: ${latestSnapshot?.followers || 0}
- Engagement Rate: ${latestSnapshot?.engagementRate || 0}
- Reach: ${latestSnapshot?.reach || 0}
- Impressions: ${latestSnapshot?.impressions || 0}

Provide:
1. Performance analysis
2. Growth insights
3. Content strategy
4. Actionable recommendations
`;

    const result = await generateAnalyticsResponse({
      analyticsContext: "Social media analytics expert.",
      historyMessages: [],
      latestUserMessage: analyticsPrompt,
    });

    return result.reply;
  } catch (error) {
    console.error("[GENERATE_ANALYTICS_INSIGHTS_ERROR]", {
      message: error.message,
    });

    return "Unable to generate analytics insights.";
  }
};
