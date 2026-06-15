import {
  generateGroqResponse,
  generateGroqStreamResponse,
} from "./providers/groqProvider.js";

import {
  generateOpenRouterResponse,
} from "./providers/openRouterProvider.js";

import {
  generateGeminiResponse,
} from "./providers/geminiProvider.js";

import {
  generateTogetherResponse,
} from "./providers/togetherProvider.js";

import {
  retryAsyncOperation,
} from "../../utils/retryHandler.js";

import {
  isProviderAvailable,
  recordProviderFailure,
  recordProviderSuccess,
} from "../../utils/circuitBreaker.js";

import logger
  from "../../utils/logger.js";

/**
 * ---------------------------------------------------
 * Provider Registry
 * ---------------------------------------------------
 */

const AI_PROVIDERS = [
  {
    name: "groq",
    handler: generateGroqResponse,
  },

  {
    name: "openrouter",
    handler: generateOpenRouterResponse,
  },

  {
    name: "together",
    handler: generateTogetherResponse,
  },

  {
    name: "gemini",
    handler: generateGeminiResponse,
  },
];

/**
 * ---------------------------------------------------
 * Generate AI Response
 * ---------------------------------------------------
 */

export const generateAIResponse =
  async ({
    prompt,
  }) => {

    const errors = [];

    for (
      const provider
      of AI_PROVIDERS
    ) {

      if (
        !isProviderAvailable(
          provider.name
        )
      ) {

        logger.warn(
          `Provider unavailable: ${provider.name}`
        );

        continue;
      }

      try {

        logger.ai(
          `Trying provider: ${provider.name}`
        );

        const response =
          await retryAsyncOperation(

            async () =>
              provider.handler({
                prompt,
              }),

            2,
            1000
          );

        recordProviderSuccess(
          provider.name
        );

        logger.success(
          `Provider success: ${provider.name}`
        );

        return response;

      } catch (error) {

        recordProviderFailure(
          provider.name
        );

        logger.error(
          `Provider failed: ${provider.name}`,
          {
            message:
              error.message,
          }
        );

        errors.push({
          provider:
            provider.name,

          error:
            error.message,
        });
      }
    }

    throw new Error(
      `All AI providers failed: ${JSON.stringify(errors)}`
    );
  };

/**
 * ---------------------------------------------------
 * Generate Streaming AI Response
 * ---------------------------------------------------
 *
 * Current Strategy:
 * Use Groq native streaming.
 *
 * Future:
 * Add provider fallback streaming.
 */

export const generateStreamingAIResponse =
  async ({
    prompt,
  }) => {

    try {

      logger.ai(
        "Starting streaming response"
      );

      return await
        generateGroqStreamResponse({

          prompt,
        });

    } catch (error) {

      logger.error(
        "Streaming response failed",
        {
          message:
            error.message,
        }
      );

      throw error;
    }
  };