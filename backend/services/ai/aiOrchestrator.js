import {
  generateGroqResponse,
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

/**
 * ---------------------------------------------------
 * AI Provider Priority
 * ---------------------------------------------------
 *
 * Order matters.
 *
 * Fastest + cheapest first.
 */

const AI_PROVIDERS = [

  {
    name: "groq",

    handler:
      generateGroqResponse,
  },

  {
    name: "openrouter",

    handler:
      generateOpenRouterResponse,
  },

  {
    name: "together",

    handler:
      generateTogetherResponse,
  },

  {
    name: "gemini",

    handler:
      generateGeminiResponse,
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

    /**
     * Try providers sequentially
     */
    for (
  const provider
  of AI_PROVIDERS
) {

  /**
   * Skip unavailable providers
   */
  const available =
    isProviderAvailable(

      provider.name
    );

  if (!available) {

    console.warn(

      `[AI_ORCHESTRATOR] Skipping unavailable provider: ${provider.name}`
    );

    continue;
  }

  try {

    console.log(

      `[AI_ORCHESTRATOR] Trying provider: ${provider.name}`
    );

    const response =
      await retryAsyncOperation(

        async () => {

          return await provider.handler({

            prompt,
          });
        },

        1,

        1000
      );

    /**
     * Record success
     */
    recordProviderSuccess(
      provider.name
    );

    console.log(

      `[AI_ORCHESTRATOR] Success from: ${provider.name}`
    );

    return response;

  } catch (error) {

    /**
     * Record failure
     */
    recordProviderFailure(
      provider.name
    );

    console.error(

      `[AI_ORCHESTRATOR_ERROR] ${provider.name}`,

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
    /**
     * All providers failed
     */
    throw new Error(

      `All AI providers failed: ${JSON.stringify(errors)}`
    );
  };