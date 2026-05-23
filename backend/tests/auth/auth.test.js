import request
  from "supertest";

import app
  from "../../app.js";

/**
 * ---------------------------------------------------
 * Auth Route Tests
 * ---------------------------------------------------
 */

describe(
  "Auth API",

  () => {

    /**
     * Test base route
     */
    test(
      "GET / should return API status",

      async () => {

        const response =
          await request(app)
            .get("/");

        expect(
          response.statusCode
        ).toBe(200);

        expect(
          response.body.success
        ).toBe(true);

        expect(
          response.body.message
        ).toContain(
          "API"
        );
      }
    );
  }
);