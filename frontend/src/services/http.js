import { apiClient } from "../api/client";

// Feature services will import this wrapper so transport details remain replaceable.
export const http = {
  get: (url, config) => apiClient.get(url, config).then((response) => response.data),
  post: (url, data, config) => apiClient.post(url, data, config).then((response) => response.data),
  patch: (url, data, config) => apiClient.patch(url, data, config).then((response) => response.data),
  delete: (url, config) => apiClient.delete(url, config).then((response) => response.data),
};
