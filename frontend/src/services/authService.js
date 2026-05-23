import api from "./api.js";

/**
 * Stable auth request configuration.
 */
const createAuthConfig = (
  token,
  signal
) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },

  /**
   * Abort-safe requests.
   */
  signal,
});

/**
 * Normalize authenticated user.
 */
const normalizeUser = (
  user = {}
) => {
  return {
    _id: user._id || "",

    name: user.name || "",

    email: user.email || "",

    username:
      user.username || "",

    createdAt:
      user.createdAt || null,
  };
};

/**
 * Normalize auth response.
 *
 * Backend contract:
 * {
 *   success,
 *   message,
 *   data
 * }
 */
const normalizeAuthResponse =
  (responseData = {}) => {
    return {
      success:
        Boolean(
          responseData.success
        ),

      message:
        responseData.message ||
        "",

      data:
        responseData.data || null,
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

    return normalizeAuthResponse(
      response.data
    );
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

    return normalizeAuthResponse(
      response.data
    );
  };

/**
 * Restore authenticated user
 * using JWT token.
 */
export const getCurrentUser =
  async ({
    token,
    signal,
  }) => {
    const response =
      await api.get(
        "/auth/me",
        createAuthConfig(
          token,
          signal
        )
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

