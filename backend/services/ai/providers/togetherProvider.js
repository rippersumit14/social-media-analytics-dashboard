import OpenAI
  from "openai";

/**
 * ---------------------------------------------------
 * Together AI Client
 * ---------------------------------------------------
 */

const togetherClient =
  new OpenAI({

    apiKey:
      process.env.TOGETHER_API_KEY,

    baseURL:
      "https://api.together.xyz/v1",
  });

/**
 * ---------------------------------------------------
 * Generate Together Response
 * ---------------------------------------------------
 */

export const generateTogetherResponse =
  async ({

    prompt,

    model =
      "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  }) => {

    const startedAt =
      Date.now();

    const completion =
      await togetherClient.chat.completions.create({

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
        "together",

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