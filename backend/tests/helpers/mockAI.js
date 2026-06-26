/**
 * --------------------------------------------------
 * Mock AI Response
 * --------------------------------------------------
 *
 * Standard AI response used across
 * multiple automation tests.
 */

export const mockAIResponse = {

  provider: "mock-provider",

  modelUsed: "mock-model",

  reply:
    "This is a mocked AI response for testing.",

  latencyMs: 25,

  generatedAt:
    new Date().toISOString(),
};

/**
 * --------------------------------------------------
 * Create Mock AI Response
 * --------------------------------------------------
 *
 * Generates a customizable AI response.
 */

export const createMockAIResponse = (
  overrides = {}
) => {

  return {

    provider: "mock-provider",

    modelUsed: "mock-model",

    reply:
      "This is a mocked AI response for testing.",

    latencyMs: 25,

    generatedAt:
      new Date().toISOString(),

    ...overrides,
  };

};

/**
 * --------------------------------------------------
 * Mock Streaming Chunks
 * --------------------------------------------------
 *
 * Simulates AI streaming responses.
 */

export const mockStreamingChunks = [

  "Hello",

  " there,",

  " this",

  " is",

  " a",

  " streamed",

  " response.",

];

/**
 * --------------------------------------------------
 * Async Mock Stream Generator
 * --------------------------------------------------
 *
 * Simulates an async iterator
 * similar to Groq streaming.
 */

export async function* createMockAIStream() {

  for (
    const chunk
    of mockStreamingChunks
  ) {

    yield {

      choices: [

        {

          delta: {

            content:
              chunk,

          },

        },

      ],

    };

  }

}

/**
 * --------------------------------------------------
 * Mock AI Failure
 * --------------------------------------------------
 *
 * Used to test provider failures,
 * retries and circuit breaker logic.
 */

export const mockAIError =
  new Error(
    "Mock AI Provider Failure"
  );

/**
 * --------------------------------------------------
 * Mock Provider Metadata
 * --------------------------------------------------
 */

export const mockProviderMetadata = {

  provider:
    "mock-provider",

  model:
    "mock-model",

  latencyMs:
    25,

  tokensUsed:
    150,

};