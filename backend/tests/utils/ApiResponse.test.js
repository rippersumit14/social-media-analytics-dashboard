/**
 * --------------------------------------------------
 * ApiResponse Utility Tests
 * --------------------------------------------------
 *
 * Utility:
 * ApiResponse
 *
 * Responsibilities:
 *
 * • Creates a standard API response
 * • Uses provided values
 * • Uses default values
 * • Stores response data
 * • Stores metadata
 */

import ApiResponse from "../../utils/ApiResponse.js";

/**
 * --------------------------------------------------
 * ApiResponse
 * --------------------------------------------------
 */

describe("ApiResponse", () => {

  /**
   * ----------------------------------------------
   * Default Values
   * ----------------------------------------------
   */

  it("should create a response with default values", () => {

    const response = new ApiResponse();

    expect(response.success).toBe(true);

    expect(response.statusCode).toBe(200);

    expect(response.message)
      .toBe("Request successful");

    expect(response.data).toBeNull();

    expect(response.meta).toBeNull();

  });

  /**
   * ----------------------------------------------
   * Custom Success Response
   * ----------------------------------------------
   */

  it("should store custom response values", () => {

    const response = new ApiResponse({

      success: true,

      statusCode: 201,

      message: "User created successfully",

      data: {

        id: "123",

        name: "Sumit",

      },

    });

    expect(response.success).toBe(true);

    expect(response.statusCode).toBe(201);

    expect(response.message)
      .toBe("User created successfully");

    expect(response.data).toEqual({

      id: "123",

      name: "Sumit",

    });

  });

  /**
   * ----------------------------------------------
   * Error Response
   * ----------------------------------------------
   */

  it("should support unsuccessful responses", () => {

    const response = new ApiResponse({

      success: false,

      statusCode: 400,

      message: "Validation failed",

    });

    expect(response.success).toBe(false);

    expect(response.statusCode).toBe(400);

    expect(response.message)
      .toBe("Validation failed");

  });

  /**
   * ----------------------------------------------
   * Metadata
   * ----------------------------------------------
   */

  it("should store metadata", () => {

    const response = new ApiResponse({

      meta: {

        page: 1,

        limit: 10,

        total: 50,

      },

    });

    expect(response.meta).toEqual({

      page: 1,

      limit: 10,

      total: 50,

    });

  });

  /**
   * ----------------------------------------------
   * Null Data
   * ----------------------------------------------
   */

  it("should allow null data", () => {

    const response = new ApiResponse({

      data: null,

    });

    expect(response.data).toBeNull();

  });

  /**
   * ----------------------------------------------
   * Array Data
   * ----------------------------------------------
   */

  it("should support array data", () => {

    const users = [

      {

        id: 1,

        name: "Alice",

      },

      {

        id: 2,

        name: "Bob",

      },

    ];

    const response = new ApiResponse({

      data: users,

    });

    expect(response.data).toEqual(users);

  });

  /**
   * ----------------------------------------------
   * Object Data
   * ----------------------------------------------
   */

  it("should support object data", () => {

    const payload = {

      user: {

        id: 1,

        name: "Sumit",

      },

      token: "jwt-token",

    };

    const response = new ApiResponse({

      data: payload,

    });

    expect(response.data).toEqual(payload);

  });

});