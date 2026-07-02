const DEFAULT_API_BASE_URL = "http://localhost:5000/api";

// Centralizes environment access so service modules do not depend on Vite directly.
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
};
