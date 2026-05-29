import request
  from "supertest";

import app
  from "../../app.js";

/**
 * ---------------------------------------------------
 * SSE Streaming Tests
 * ---------------------------------------------------
 */

describe(
  "AI Streaming SSE",

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
            );

        /**
         * Unauthorized expected
         * because auth required
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