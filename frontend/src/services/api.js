import axios from "axios";

/**
 * Stable backend API URL.
 */
const API_BASE_URL =
  import.meta.env
    .VITE_API_URL ||
  "http://localhost:5000/api";

/**
 * Production-grade Axios instance.
 *
 * Centralized frontend API infrastructure.
 */
const api = axios.create({
  baseURL: API_BASE_URL,

  /**
   * Default request timeout.
   *
   * Prevent hanging AI requests.
   */
  timeout: 30000,

  headers: {
    "Content-Type":
      "application/json",
  },
});

/**
 * Normalize backend errors safely.
 */
const normalizeApiError = (
  error
) => {
  /**
   * Request cancelled.
   */
  if (
    axios.isCancel(error)
  ) {
    return {
      message:
        "Request cancelled.",

      status: null,

      cancelled: true,
    };
  }

  /**
   * Timeout handling.
   */
  if (
    error.code ===
    "ECONNABORTED"
  ) {
    return {
      message:
        "Request timeout. Please try again.",

      status: 408,
    };
  }

  /**
   * No backend response.
   */
  if (!error.response) {
    return {
      message:
        "Network error. Please check your internet connection.",

      status: 503,
    };
  }

  /**
   * Stable backend message extraction.
   */
  return {
    message:
      error.response?.data
        ?.message ||
      "Something went wrong.",

    status:
      error.response?.status ||
      500,

    data:
      error.response?.data ||
      null,
  };
};

/**
 * Request interceptor.
 *
 * Future-ready for:
 * - auth refresh
 * - tracing
 * - analytics
 * - observability
 */
api.interceptors.request.use(
  (config) => {
    /**
     * Production-safe debug logging.
     */
    if (
      import.meta.env.DEV
    ) {
      console.debug(
        `[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    return config;
  },

  (error) => {
    return Promise.reject(
      normalizeApiError(
        error
      )
    );
  }
);

/**
 * Response interceptor.
 *
 * Centralizes:
 * - error normalization
 * - auth handling
 * - logging
 */
api.interceptors.response.use(
  (response) => {
    /**
     * Development logging only.
     */
    if (
      import.meta.env.DEV
    ) {
      console.debug(
        `[API RESPONSE] ${response.status} ${response.config.url}`
      );
    }

    return response;
  },

  (error) => {
    const normalizedError =
      normalizeApiError(
        error
      );

    /**
     * Unauthorized handling.
     *
     * Future:
     * refresh token flow.
     */
    if (
      normalizedError.status ===
      401
    ) {
      console.warn(
        "Unauthorized request detected."
      );
    }

    /**
     * Production-safe error logging.
     */
    if (
      import.meta.env.DEV
    ) {
      console.error(
        "[API ERROR]",
        normalizedError
      );
    }

    return Promise.reject(
      normalizedError
    );
  }
);

export default api;