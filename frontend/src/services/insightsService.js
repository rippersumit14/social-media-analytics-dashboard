import { apiEndpoints } from "../api/endpoints";
import { http } from "./http";

export const insightsService = {
  async list(limit = 20) {
    const response = await http.get(apiEndpoints.creatorInsights.list, {
      params: { limit },
    });

    return response.data || [];
  },

  async generate() {
    return http.post(apiEndpoints.creatorInsights.generate);
  },
};
