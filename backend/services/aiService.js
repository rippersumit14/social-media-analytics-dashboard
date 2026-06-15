import {
  generateAIResponse,
  generateStreamingAIResponse,
} from "./ai/aiOrchestrator.js";

import logger
  from "../utils/logger.js";

/**
 * ---------------------------------------------------
 * Creator Growth AI System Prompt
 * ---------------------------------------------------
 */

const SYSTEM_PROMPT = `
You are Creator Growth AI.

Your role is to help content creators grow their audience,
improve engagement, understand analytics,
and make better content decisions.

Responsibilities:

- Analyze creator performance
- Explain analytics metrics
- Identify growth bottlenecks
- Suggest content improvements
- Recommend engagement strategies
- Answer creator-related questions

Rules:

- Never invent analytics data
- Only use provided context
- Be actionable and practical
- Prefer concise responses
- Use bullet points when useful
- Explain reasoning clearly
`;

/**
 * ---------------------------------------------------
 * Build Chat History
 * ---------------------------------------------------
 */

const buildHistorySection =
  (historyMessages = []) => {

    const limitedHistory =
      historyMessages.slice(-10);

    if (
      limitedHistory.length === 0
    ) {

      return "No previous conversation.";
    }

    return limitedHistory
      .map(
        (message) =>
          `${message.role.toUpperCase()}: ${message.content}`
      )
      .join("\n");
  };

/**
 * ---------------------------------------------------
 * Build Final Prompt
 * ---------------------------------------------------
 */

const buildFinalPrompt =
  ({
    creatorContext,
    historyMessages,
    latestUserMessage,
  }) => {

    const history =
      buildHistorySection(
        historyMessages
      );

    return `
${SYSTEM_PROMPT}

==================================================
CREATOR CONTEXT
==================================================

${creatorContext || "No creator context available."}

==================================================
CONVERSATION HISTORY
==================================================

${history}

==================================================
USER QUESTION
==================================================

${latestUserMessage}

==================================================
INSTRUCTIONS
==================================================

Answer using the creator context.

If context is missing,
state that clearly.

Provide actionable insights.
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

      generatedAt:
        new Date()
          .toISOString(),
    };
  };

/**
 * ---------------------------------------------------
 * Generate AI Response
 * ---------------------------------------------------
 */

export const generateAnalyticsResponse =
  async ({
    creatorContext,
    historyMessages = [],
    latestUserMessage,
  }) => {

    const startTime =
      Date.now();

    try {

      logger.ai(
        "AI request started"
      );

      /**
       * Build Prompt
       */

      const finalPrompt =
        buildFinalPrompt({

          creatorContext,

          historyMessages,

          latestUserMessage,
        });

      /**
       * Execute AI Request
       */

      const aiResult =
        await generateAIResponse({

          prompt:
            finalPrompt,
        });

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
 * Generate Streaming Response
 * ---------------------------------------------------
 */

export const generateStreamingAnalyticsResponse =
  async ({
    creatorContext,
    historyMessages = [],
    latestUserMessage,
  }) => {

    try {

      logger.ai(
        "Streaming AI request started"
      );

      const finalPrompt =
        buildFinalPrompt({

          creatorContext,

          historyMessages,

          latestUserMessage,
        });

      return await
        generateStreamingAIResponse({

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