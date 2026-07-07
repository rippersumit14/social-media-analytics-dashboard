import { apiEndpoints } from "../api/endpoints";
import { http } from "./http";

export const analyticsService = {
  async getLatestSnapshot() {
    const response = await http.get(apiEndpoints.instagram.analyticsLatest);

    return response.data;
  },

  async getHistory(limit = 30) {
    const response = await http.get(apiEndpoints.instagram.analyticsHistory, {
      params: { limit },
    });

    return response.data || [];
  },

  async createSnapshot() {
    return http.post(apiEndpoints.instagram.analyticsSnapshot);
  },
};
