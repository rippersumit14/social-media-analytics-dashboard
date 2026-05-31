// services/aiService.js

import {
  generateAIResponse,
  generateStreamingAIResponse,
} from "./ai/aiOrchestrator.js";

import logger
  from "../utils/logger.js";

/**
 * ---------------------------------------------------
 * AI System Prompt
 * ---------------------------------------------------
 *
 * Core AI behavior layer.
 */

const SYSTEM_PROMPT = `
You are an advanced AI social media analytics assistant.

Your responsibilities:
- analyze analytics data
- explain engagement metrics
- suggest growth strategies
- analyze audience behavior
- explain content performance
- help creators improve social media growth

Guidelines:
- always provide structured responses
- prioritize actionable insights
- explain analytics clearly
- avoid hallucinating fake metrics
- be concise but insightful
- support multimodal image understanding
`;

/**
 * ---------------------------------------------------
 * Build Final AI Prompt
 * ---------------------------------------------------
 *
 * Combines:
 * - analytics context
 * - history messages
 * - latest user message
 */

const buildFinalPrompt =
  ({

    analyticsContext,

    historyMessages = [],

    latestUserMessage,
  }) => {

    /**
     * Normalize history
     */

    const formattedHistory =
      historyMessages

        .map(

          (message) => {

            return `${message.role.toUpperCase()}: ${message.content}`;
          }
        )

        .join("\n");

    /**
     * Final prompt
     */

    return `
${SYSTEM_PROMPT}

--------------------------------------------------
ANALYTICS CONTEXT
--------------------------------------------------

${analyticsContext || "No analytics context available."}

--------------------------------------------------
CHAT HISTORY
--------------------------------------------------

${formattedHistory || "No previous history."}

--------------------------------------------------
LATEST USER MESSAGE
--------------------------------------------------

${latestUserMessage}
`;
  };

/**
 * ---------------------------------------------------
 * Normalize AI Response
 * ---------------------------------------------------
 */

const normalizeAIResponse =
  (
    aiResult,
    latencyMs
  ) => {

    return {

      reply:
        aiResult?.reply ||

        "AI response unavailable.",

      provider:
        aiResult?.provider ||

        "unknown",

      modelUsed:
        aiResult?.modelUsed ||

        "unknown",

      latencyMs,
    };
  };

/**
 * ---------------------------------------------------
 * Generate Analytics AI Response
 * ---------------------------------------------------
 *
 * Main non-streaming AI execution flow.
 */

export const generateAnalyticsResponse =
  async ({

    analyticsContext,

    historyMessages,

    latestUserMessage,
  }) => {

    const startTime =
      Date.now();

    try {

      /**
       * Build AI prompt
       */

      const finalPrompt =
        buildFinalPrompt({

          analyticsContext,

          historyMessages,

          latestUserMessage,
        });

      logger.ai(
        "Generating AI response"
      );

      /**
       * Execute AI orchestration
       */

      const aiResult =
        await generateAIResponse({

          prompt:
            finalPrompt,
        });

      /**
       * Track latency
       */

      const latencyMs =
        Date.now() -
        startTime;

      logger.success(

        "AI response generated",

        {

          provider:
            aiResult.provider,

          model:
            aiResult.modelUsed,

          latencyMs,
        }
      );

      /**
       * Normalized AI contract
       */

      return normalizeAIResponse(

        aiResult,

        latencyMs
      );

    } catch (error) {

      logger.error(

        "AI generation failed",

        {

          message:
            error.message,
        }
      );

      throw error;
    }
  };

/**
 * ---------------------------------------------------
 * Generate Streaming Analytics Response
 * ---------------------------------------------------
 *
 * SSE streaming execution flow.
 */

export const generateStreamingAnalyticsResponse =
  async ({

    analyticsContext,

    historyMessages,

    latestUserMessage,
  }) => {

    try {

      /**
       * Build AI prompt
       */

      const finalPrompt =
        buildFinalPrompt({

          analyticsContext,

          historyMessages,

          latestUserMessage,
        });

      logger.ai(
        "Starting streaming AI response"
      );

      /**
       * Start provider stream
       */

      return await generateStreamingAIResponse({

        prompt:
          finalPrompt,
      });

    } catch (error) {

      logger.error(

        "Streaming AI failed",

        {

          message:
            error.message,
        }
      );

      throw error;
    }
  };