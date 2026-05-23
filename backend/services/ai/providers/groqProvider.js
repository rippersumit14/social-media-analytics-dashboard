import OpenAI
  from "openai";

/**
 * ---------------------------------------------------
 * Groq Client
 * ---------------------------------------------------
 */

const groqClient =
  new OpenAI({

    apiKey:
      process.env.GROQ_API_KEY,

    baseURL:
      "https://api.groq.com/openai/v1",
  });

/**
 * ---------------------------------------------------
 * Generate Groq Response
 * ---------------------------------------------------
 */

export const generateGroqResponse =
  async ({

    prompt,

    model =
      "llama-3.3-70b-versatile",
  }) => {

    const startedAt =
      Date.now();

    const completion =
      await groqClient.chat.completions.create({

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
        "groq",

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

//GENERATE Groq Streaming Response
export const generateGroqStreamResponse = 
   async({
    prompt,
   }) => {
    const stream = 
      await groqClient.chat.completions.create({
        model:
          "llama-3.3-70b-versatile",

          messages: [
            {
                role: "user",

                content: 
                   prompt,
            },
          ],

          stream: true,
      });

      return stream;
   };