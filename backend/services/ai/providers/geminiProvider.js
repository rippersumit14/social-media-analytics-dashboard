import {
  GoogleGenAI,
} from "@google/genai";

/**
 * ---------------------------------------------------
 * Gemini Client
 * ---------------------------------------------------
 */

const geminiClient =
  new GoogleGenAI({

    apiKey:
      process.env.GEMINI_API_KEY,
  });

/**
 * ---------------------------------------------------
 * Generate Gemini Response
 * ---------------------------------------------------
 */

export const generateGeminiResponse =
  async ({

    prompt,

    model =
      "gemini-2.0-flash",
  }) => {

    const startedAt =
      Date.now();

    const response =
      await geminiClient.models.generateContent({

        model,

        contents:
          prompt,
      });

    const latencyMs =
      Date.now() -
      startedAt;

    return {

      provider:
        "gemini",

      type:
        "text",

      modelUsed:
        model,

      reply:
        response.text,

      latencyMs,
    };
  };