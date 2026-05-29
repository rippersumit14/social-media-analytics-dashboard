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
   * AI requests can override this.
   */
  timeout: 30000,

  headers: {
    "Content-Type":
      "application/json",
  },
});

/**
 * Stable auth token accessor.
 *
 * Prevents stale token usage.
 */
const getAuthToken =
  () => {
    return localStorage.getItem(
      "token"
    );
  };

/**
 * Centralized auth cleanup.
 */
const clearAuthState =
  () => {
    localStorage.removeItem(
      "token"
    );
  };

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
      success: false,

      message:
        "Request cancelled.",

      status: null,

      cancelled: true,
    };
  }

  /**
   * AbortController lifecycle.
   */
  if (
    error.name ===
    "CanceledError"
  ) {
    return {
      success: false,

      message:
        "Request cancelled.",

      status: null,

      cancelled: true,
    };
  }

  /**
   * Timeout lifecycle.
   */
  if (
    error.code ===
    "ECONNABORTED"
  ) {
    return {
      success: false,

      message:
        "Request timeout. Please try again.",

      status: 408,
    };
  }

  /**
   * Backend unavailable.
   */
  if (!error.response) {
    return {
      success: false,

      message:
        "Network error. Please check your internet connection.",

      status: 503,
    };
  }

  /**
   * Stable backend normalization.
   */
  return {
    success: false,

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
 * Handles:
 * - auth injection
 * - logging
 * - observability
 * - future tracing
 */
api.interceptors.request.use(
  (config) => {
    /**
     * Stable auth injection.
     */
    const token =
      getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /**
     * Production-safe logging.
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
 * - backend normalization
 * - auth cleanup
 * - logging
 * - future retry logic
 */
api.interceptors.response.use(
  (response) => {
    /**
     * Development logging.
     */
    if (
      import.meta.env.DEV
    ) {
      console.debug(
        `[API RESPONSE] ${response.status} ${response.config.url}`
      );
    }

    /**
     * Stable backend contract.
     *
     * Expected:
     * {
     *   success,
     *   message,
     *   data
     * }
     */
    return response;
  },

  (error) => {
    const normalizedError =
      normalizeApiError(
        error
      );

    /**
     * Unauthorized lifecycle.
     *
     * Future-ready for:
     * - refresh tokens
     * - silent reauth
     */
    if (
      normalizedError.status ===
      401
    ) {
      console.warn(
        "[AUTH] Unauthorized request."
      );

      /**
       * Prevent stale auth states.
       */
      clearAuthState();

      /**
       * Prevent redirect loops.
       */
      if (
        window.location.pathname !==
        "/"
      ) {
        window.location.href =
          "/";
      }
    }

    /**
     * Production-safe logging.
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

/**
 * SSE-safe AI request helper.
 *
 * Longer timeout support.
 */
export const createAIRequestConfig =
  (
    config = {}
  ) => {
    return {
      timeout: 120000,

      ...config,
    };
  };

/**
 * Upload-safe request helper.
 */
export const createUploadRequestConfig =
  (
    config = {}
  ) => {
    return {
      timeout: 120000,

      headers: {
        "Content-Type":
          "multipart/form-data",
      },

      ...config,
    };
  };

export default api;