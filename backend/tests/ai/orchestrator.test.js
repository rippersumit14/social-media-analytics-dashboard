import {
  generateAIResponse,
} from "../../services/ai/aiOrchestrator.js";

/**
 * ---------------------------------------------------
 * AI Orchestrator Tests
 * ---------------------------------------------------
 */

describe(
  "AI Orchestrator",

  () => {

    test(
      "should generate AI response",

      async () => {

        const response =
          await generateAIResponse({

            prompt:
              "Explain social media engagement growth",
          });

        expect(
          response
        ).toBeDefined();

        expect(
          response.reply
        ).toBeDefined();

        expect(
          typeof response.reply
        ).toBe("string");

        expect(
          response.provider
        ).toBeDefined();

        expect(
          response.modelUsed
        ).toBeDefined();
      },

      30000
    );
  }
);