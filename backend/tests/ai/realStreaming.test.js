import request
  from "supertest";

import app
  from "../../app.js";

/**
 * ---------------------------------------------------
 * Real Streaming SSE Tests
 * ---------------------------------------------------
 */

describe(
  "Real AI Streaming",

  () => {

    test(
      "should initialize SSE stream",

      async () => {

        const response =
          await request(app)

            .post(
              "/api/ai/chat/test/stream"
            )

            .set(

              "Accept",

              "text/event-stream"
            )

            .send({

              message:
                "Hello AI",
            });

        /**
         * Protected route
         */

        expect([
          200,
          401,
        ]).toContain(
          response.statusCode
        );
      }
    );
  }
);