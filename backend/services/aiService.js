import AppError
  from "../utils/AppError.js";

import logger
  from "../utils/logger.js";

import {

  generateAIResponse,

  generateStreamingAIResponse,

} from "./ai/aiOrchestrator.js";

import {
  optimizeConversationHistory,
} from "../utils/memoryOptimizer.js";

/**
 * ---------------------------------------------------
 * AI Configuration
 * ---------------------------------------------------
 */

/**
 * Maximum AI response length
 */
const MAX_RESPONSE_LENGTH =
  15000;

/**
 * ---------------------------------------------------
 * Sanitize AI Response
 * ---------------------------------------------------
 *
 * Cleans unwanted characters
 * and limits response size.
 */

const sanitizeAIResponse =
  (
    response = ""
  ) => {

    if (!response) {

      return (
        "No AI response generated."
      );
    }

    return response

      /**
       * Remove excessive spaces
       */
      .replace(/\s+/g, " ")

      /**
       * Remove invisible unicode chars
       */
      .replace(
        /[\u200B-\u200D\uFEFF]/g,
        ""
      )

      /**
       * Trim response
       */
      .trim()

      /**
       * Limit response size
       */
      .slice(
        0,
        MAX_RESPONSE_LENGTH
      );
  };

/**
 * ---------------------------------------------------
 * Build AI Prompt
 * ---------------------------------------------------
 */

const buildPrompt =
  ({

    analyticsContext,

    historyMessages,

    latestUserMessage,
  }) => {

    /**
     * Convert conversation history
     * into structured text
     */
    const history =
      historyMessages
        ?.map(
          (message) =>

            `${message.role.toUpperCase()}: ${message.content}`
        )
        .join("\n");

    /**
     * Final AI prompt
     */
    return `
You are an elite AI social media strategist and analytics expert.

--------------------------------------------------
ANALYTICS CONTEXT
--------------------------------------------------

${analyticsContext}

--------------------------------------------------
PREVIOUS CONVERSATION
--------------------------------------------------

${history || "No previous conversation"}

--------------------------------------------------
LATEST USER MESSAGE
--------------------------------------------------

${latestUserMessage}

--------------------------------------------------
IMPORTANT INSTRUCTIONS
--------------------------------------------------

- Be strategic
- Give intelligent insights
- Avoid generic advice
- Explain growth deeply
- Suggest actionable improvements
- Be concise but valuable
- Respond professionally
`;
  };

/**
 * ---------------------------------------------------
 * Generate Standard AI Response
 * ---------------------------------------------------
 */

export const generateAnalyticsResponse =
  async ({

    analyticsContext,

    historyMessages = [],

    latestUserMessage,
  }) => {

    const startedAt =
      Date.now();

    try {

      /**
       * ---------------------------------------------------
       * Optimize conversation memory
       * ---------------------------------------------------
       */

      const optimizedHistory =
        optimizeConversationHistory(

          historyMessages
        );

      /**
       * ---------------------------------------------------
       * Build AI prompt
       * ---------------------------------------------------
       */

      const prompt =
        buildPrompt({

          analyticsContext,

          historyMessages:
            optimizedHistory,

          latestUserMessage,
        });

      logger.ai(
        "Starting AI orchestration"
      );

      /**
       * ---------------------------------------------------
       * Generate AI response
       * through orchestrator
       * ---------------------------------------------------
       */

      const aiResponse =
        await generateAIResponse({

          prompt,
        });

      /**
       * ---------------------------------------------------
       * Sanitize AI reply
       * ---------------------------------------------------
       */

      const cleanedReply =
        sanitizeAIResponse(

          aiResponse.reply
        );

      /**
       * ---------------------------------------------------
       * Calculate latency
       * ---------------------------------------------------
       */

      const latencyMs =
        Date.now() -
        startedAt;

      logger.success(
        "AI response generated successfully",

        {
          provider:
            aiResponse.provider,

          model:
            aiResponse.modelUsed,

          latencyMs,
        }
      );

      /**
       * ---------------------------------------------------
       * Unified AI response
       * ---------------------------------------------------
       */

      return {

        reply:
          cleanedReply,

        provider:
          aiResponse.provider,

        modelUsed:
          aiResponse.modelUsed,

        latencyMs,

        generatedAt:
          new Date().toISOString(),
      };

    } catch (error) {

      logger.error(
        "AI generation failed",

        {
          message:
            error.message,

          stack:
            process.env.NODE_ENV ===
            "development"

              ? error.stack

              : undefined,
        }
      );

      /**
       * ---------------------------------------------------
       * AI quota exceeded
       * ---------------------------------------------------
       */

      if (
        error.message?.includes(
          "quota"
        )
      ) {

        throw new AppError(
          "AI quota exceeded",
          429
        );
      }

      /**
       * ---------------------------------------------------
       * Timeout error
       * ---------------------------------------------------
       */

      if (
        error.message?.includes(
          "timeout"
        )
      ) {

        throw new AppError(
          "AI request timed out",
          408
        );
      }

      /**
       * ---------------------------------------------------
       * Generic AI failure
       * ---------------------------------------------------
       */

      throw new AppError(
        "Failed to generate AI response",
        500
      );
    }
  };

/**
 * ---------------------------------------------------
 * Generate Streaming AI Response
 * ---------------------------------------------------
 */

export const generateStreamingAnalyticsResponse =
  async ({

    analyticsContext,

    historyMessages = [],

    latestUserMessage,
  }) => {

    /**
     * ---------------------------------------------------
     * Optimize memory for streaming
     * ---------------------------------------------------
     */

    const optimizedHistory =
      optimizeConversationHistory(

        historyMessages
      );

    /**
     * ---------------------------------------------------
     * Build AI prompt
     * ---------------------------------------------------
     */

    const prompt =
      buildPrompt({

        analyticsContext,

        historyMessages:
          optimizedHistory,

        latestUserMessage,
      });

    /**
     * ---------------------------------------------------
     * Start streaming AI generation
     * ---------------------------------------------------
     */

    return await generateStreamingAIResponse({

      prompt,
    });
  };