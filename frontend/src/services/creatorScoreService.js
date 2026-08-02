import { apiEndpoints } from "../api/endpoints";
import { http } from "./http";

export const creatorScoreService = {
  async getLatest() {
    const response = await http.get(apiEndpoints.creatorScore.latest);

    return response.data;
  },

  async getHistory(limit = 30) {
    const response = await http.get(apiEndpoints.creatorScore.history, {
      params: { limit },
    });

    return response.data || [];
  },

  async calculate() {
    return http.post(apiEndpoints.creatorScore.calculate);
  },
};
