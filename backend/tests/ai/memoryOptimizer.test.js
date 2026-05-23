import {
  optimizeConversationHistory,
} from "../../utils/memoryOptimizer.js";

describe(
  "Memory Optimizer",

  () => {

    test(
      "should trim old messages",

      () => {

        const messages =
          Array.from(

            { length: 20 },

            (_, index) => ({

              role: "user",

              content:
                `message ${index}`,
            })
          );

        const optimized =
          optimizeConversationHistory(

            messages
          );

        expect(
          optimized.length
        ).toBeLessThanOrEqual(
          12
        );
      }
    );

    test(
      "should preserve latest messages",

      () => {

        const messages =
          Array.from(

            { length: 20 },

            (_, index) => ({

              role: "user",

              content:
                `message ${index}`,
            })
          );

        const optimized =
          optimizeConversationHistory(

            messages
          );

        expect(

          optimized[
            optimized.length - 1
          ].content

        ).toBe(
          "message 19"
        );
      }
    );
  }
);