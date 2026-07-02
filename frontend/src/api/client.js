import axios from "axios";

import { env } from "../config/env";
import { clearStoredToken, getStoredToken } from "../utils/authStorage";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20_000,
});

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

// The auth provider owns token lifecycle; the client only attaches the current token.
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredToken();
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  },
);
