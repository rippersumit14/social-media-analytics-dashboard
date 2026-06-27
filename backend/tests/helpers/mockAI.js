/**
 * --------------------------------------------------
 * Mock AI Responses
 * --------------------------------------------------
 *
 * Reusable fake AI responses for testing.
 *
 * Responsibilities:
 *
 * • Success responses
 * • Streaming chunks
 * • Provider failures
 * • Empty responses
 *
 * NOTE:
 * This file only exports data.
 * It does NOT mock SDKs.
 */

/**
 * --------------------------------------------------
 * Successful AI Response
 * --------------------------------------------------
 */

export const mockAIResponse = {

  reply:
    "Based on your analytics, posting consistently 3-4 times per week and increasing Reels content can improve your engagement rate.",

  provider: "groq",

  modelUsed: "llama-3.3-70b-versatile",

  latencyMs: 1200,

};

/**
 * --------------------------------------------------
 * Empty AI Response
 * --------------------------------------------------
 */

export const mockEmptyAIResponse = {

  reply: "",

  provider: "groq",

  modelUsed: "llama-3.3-70b-versatile",

  latencyMs: 0,

};

/**
 * --------------------------------------------------
 * Streaming Chunks
 * --------------------------------------------------
 *
 * Mimics streamed tokens from an AI provider.
 */

export const mockStreamingChunks = [

  {
    choices: [
      {
        delta: {
          content: "Hello",
        },
      },
    ],
  },

  {
    choices: [
      {
        delta: {
          content: " there",
        },
      },
    ],
  },

  {
    choices: [
      {
        delta: {
          content: "! How can I help you?",
        },
      },
    ],
  },

];

/**
 * --------------------------------------------------
 * Provider Failure
 * --------------------------------------------------
 */

export const mockAIError = new Error(
  "AI provider unavailable"
);

/**
 * --------------------------------------------------
 * AI Provider Metadata
 * --------------------------------------------------
 */

export const mockProviderInfo = {

  provider: "groq",

  model: "llama-3.3-70b-versatile",

};