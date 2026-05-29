import api from "./api.js";

/**
 * Normalize authenticated user safely.
 */
const normalizeUser = (
  user = {}
) => {
  return {
    _id:
      user._id || "",

    name:
      user.name || "",

    email:
      user.email || "",

    username:
      user.username || "",

    createdAt:
      user.createdAt ||
      null,
  };
};

/**
 * Normalize backend auth response.
 *
 * Backend contract:
 * {
 *   success,
 *   message,
 *   data
 * }
 */
const normalizeAuthResponse =
  (
    responseData = {}
  ) => {
    return {
      success:
        Boolean(
          responseData.success
        ),

      message:
        responseData.message ||
        "",

      data:
        responseData.data ||
        null,
    };
  };

/**
 * Register new user.
 */
export const registerUser =
  async ({
    userData,
    signal,
  }) => {
    const response =
      await api.post(
        "/auth/register",
        userData,
        {
          signal,
        }
      );

    const normalized =
      normalizeAuthResponse(
        response.data
      );

    return {
      ...normalized,

      /**
       * Stable user normalization.
       */
      data: {
        ...normalized.data,

        user:
          normalizeUser(
            normalized
              .data
              ?.user
          ),
      },
    };
  };

/**
 * Login existing user.
 */
export const loginUser =
  async ({
    userData,
    signal,
  }) => {
    const response =
      await api.post(
        "/auth/login",
        userData,
        {
          signal,
        }
      );

    const normalized =
      normalizeAuthResponse(
        response.data
      );

    return {
      ...normalized,

      /**
       * Stable user normalization.
       */
      data: {
        ...normalized.data,

        user:
          normalizeUser(
            normalized
              .data
              ?.user
          ),
      },
    };
  };

/**
 * Restore authenticated user
 * using stored JWT token.
 *
 * Auth header injected automatically
 * by api.js interceptor.
 */
export const getCurrentUser =
  async ({
    signal,
  } = {}) => {
    const response =
      await api.get(
        "/auth/me",
        {
          signal,
        }
      );

    const normalized =
      normalizeAuthResponse(
        response.data
      );

    return {
      ...normalized,

      data:
        normalizeUser(
          normalized.data
        ),
    };
  };