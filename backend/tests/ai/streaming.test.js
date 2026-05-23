import request
  from "supertest";

import app
  from "../../app.js";

/**
 * ---------------------------------------------------
 * Streaming Tests
 * ---------------------------------------------------
 */

describe(
  "AI Streaming",

  () => {

    test(
      "should connect to streaming endpoint",

      async () => {

        const response =
          await request(app)

            .post(
              "/api/ai/chat/test/stream"
            )

            .send({

              message:
                "Hello AI",
            });

        expect(
          response.status
        ).not.toBe(404);
      },

      30000
    );
  }
);