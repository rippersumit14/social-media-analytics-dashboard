import { jest } from "@jest/globals";
import { z } from "zod";

import validateRequest from "../../middlewares/validateRequest.js";

describe("validateRequest middleware", () => {
  it("passes parsed body data to the next middleware", () => {
    const schema = z.object({
      email: z.string().email(),
      name: z.string().min(2),
    });

    const req = {
      body: {
        email: "USER@Example.com",
        name: "Sumit",
      },
      params: {},
      query: {},
    };

    const next = jest.fn();

    validateRequest(schema)(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({
      email: "USER@Example.com",
      name: "Sumit",
    });
  });

  it("returns an AppError with Zod v4 validation issues", () => {
    const schema = z.object({
      email: z.string().email(),
    });

    const req = {
      body: {
        email: "not-an-email",
      },
      params: {},
      query: {},
    };

    const next = jest.fn();

    validateRequest(schema)(req, {}, next);

    const error =
      next.mock.calls[0][0];

    expect(error.statusCode).toBe(400);
    expect(error.message).toContain("Validation failed");
    expect(error.message).toContain("email");
  });
});
