/**
 * AI Service
 *
 * FINAL STABLE ARCHITECTURE
 *
 * TEXT:
 * → Groq
 *
 * IMAGE:
 * → OCR extraction
 * → Groq analysis
 *
 * Why?
 * - reliable
 * - scalable
 * - free-tier friendly
 * - production practical
 *
 * Streaming:
 * - handled in controller
 * - simulated SSE streaming
 */

import Groq from "groq-sdk";

import {
  extractTextFromImage,
} from "./ocrService.js";

/**
 * Groq client
 */
const groq = new Groq({
  apiKey:
    process.env.GROQ_API_KEY,
});

/**
 * Stable production model
 */
const GROQ_MODEL =
  "llama-3.3-70b-versatile";

/**
 * OCR text size limit
 *
 * Prevents:
 * - token explosion
 * - huge prompts
 * - server overload
 */
const MAX_IMAGE_CONTEXT =
  3000;

/**
 * Build system prompt
 */
const buildSystemPrompt = (
  analyticsContext
) => {
  return `
You are a professional AI assistant inside a social media analytics SaaS platform.

Your personality:
- professional
- concise
- strategic
- practical
- conversational
- analytical

Your job:
- analyze social media performance
- analyze screenshots
- understand analytics
- suggest growth strategies
- explain engagement metrics
- provide actionable insights

Analytics Context:
${analyticsContext}
`;
};

/**
 * Convert history to text
 */
const buildHistoryText = (
  historyMessages = []
) => {
  return historyMessages
    .map(
      (message) =>
        `${message.role}: ${message.content}`
    )
    .join("\n");
};

/**
 * Build OCR context
 */
const buildOCRContext = (
  extractedText
) => {
  if (!extractedText) {
    return "";
  }

  return `
Image OCR Extracted Text:
${extractedText.slice(
  0,
  MAX_IMAGE_CONTEXT
)}

Analyze this image intelligently based on the extracted content.
`;
};

/**
 * Final AI prompt
 */
const buildFinalPrompt = ({
  analyticsContext,
  historyMessages,
  latestUserMessage,
  extractedOCRText,
}) => {
  return `
${buildSystemPrompt(
  analyticsContext
)}

Conversation History:
${buildHistoryText(
  historyMessages
)}

${buildOCRContext(
  extractedOCRText
)}

Latest User Message:
${latestUserMessage}

Provide:
- clear analysis
- useful insights
- practical suggestions
- structured response
`;
};

/**
 * Generate Groq response
 */
const generateGroqResponse =
  async ({
    finalPrompt,
  }) => {
    const completion =
      await groq.chat.completions.create(
        {
          model:
            GROQ_MODEL,

          messages: [
            {
              role: "user",

              content:
                finalPrompt,
            },
          ],

          temperature: 0.7,

          max_tokens: 2048,
        }
      );

    return (
      completion.choices?.[0]
        ?.message?.content ||
      "No response generated."
    );
  };

/**
 * Main AI router
 */
export const generateAnalyticsResponse =
  async ({
    analyticsContext,
    historyMessages = [],
    latestUserMessage,
    imageBase64 = null,
    imageMimeType = null,
  }) => {
    const startTime =
      Date.now();

    try {
      let extractedOCRText =
        "";

      /**
       * IMAGE ANALYSIS FLOW
       *
       * OCR → Groq
       */
      if (imageBase64) {
        try {
          /**
           * Convert base64 to buffer
           */
          const imageBuffer =
            Buffer.from(
              imageBase64,
              "base64"
            );

          /**
           * Extract OCR text
           */
          extractedOCRText =
            await extractTextFromImage(
              imageBuffer
            );

          console.log(
            "[OCR_TEXT_EXTRACTED]",
            {
              length:
                extractedOCRText.length,
            }
          );
        } catch (ocrError) {
          console.error(
            "[OCR_PIPELINE_ERROR]",
            {
              message:
                ocrError.message,
            }
          );

          /**
           * OCR should NEVER crash AI
           */
          extractedOCRText =
            "";
        }
      }

      /**
       * Build final prompt
       */
      const finalPrompt =
        buildFinalPrompt({
          analyticsContext,

          historyMessages,

          latestUserMessage,

          extractedOCRText,
        });

      /**
       * Generate AI response
       */
      const reply =
        await generateGroqResponse(
          {
            finalPrompt,
          }
        );

      return {
        reply,

        modelUsed:
          GROQ_MODEL,

        modelName:
          "Groq Llama 3.3",

        latencyMs:
          Date.now() -
          startTime,

        failed: false,
      };
    } catch (error) {
      console.error(
        "[AI_RESPONSE_ERROR]",
        {
          message:
            error.message,

          stack:
            error.stack,
        }
      );

      return {
        reply:
          "AI is currently busy, please try again.",

        modelUsed:
          "fallback",

        modelName:
          "Fallback",

        latencyMs:
          Date.now() -
          startTime,

        failed: true,
      };
    }
  };

/**
 * Analytics insights helper
 *
 * Compatibility layer
 */
export const generateAnalyticsInsights =
  async (
    socialAccount,
    snapshots,
    customPrompt = null
  ) => {
    try {
      const latestSnapshot =
        snapshots?.[
          snapshots.length - 1
        ] || {};

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

      const result =
        await generateAnalyticsResponse(
          {
            analyticsContext:
              "Social media analytics expert.",

            historyMessages:
              [],

            latestUserMessage:
              analyticsPrompt,
          }
        );

      return result.reply;
    } catch (error) {
      console.error(
        "[GENERATE_ANALYTICS_INSIGHTS_ERROR]",
        {
          message:
            error.message,
        }
      );

      return "Unable to generate analytics insights.";
    }
  };