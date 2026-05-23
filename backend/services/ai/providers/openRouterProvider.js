import OpenAI
  from "openai";

/**
 * ---------------------------------------------------
 * OpenRouter Client
 * ---------------------------------------------------
 */

const openRouterClient =
  new OpenAI({

    apiKey:
      process.env.OPENROUTER_API_KEY,

    baseURL:
      "https://openrouter.ai/api/v1",
  });

/**
 * ---------------------------------------------------
 * Generate OpenRouter Response
 * ---------------------------------------------------
 */

export const generateOpenRouterResponse =
  async ({

    prompt,

    model =
      "deepseek/deepseek-chat",
  }) => {

    const startedAt =
      Date.now();

    const completion =
      await openRouterClient.chat.completions.create({

        model,

        messages: [

          {
            role: "user",

            content:
              prompt,
          },
        ],
      });

    const latencyMs =
      Date.now() -
      startedAt;

    return {

      provider:
        "openrouter",

      type:
        "text",

      modelUsed:
        model,

      reply:
        completion
          .choices?.[0]
          ?.message?.content ||

        "No response generated",

      latencyMs,
    };
  };