import { apiEndpoints } from "../api/endpoints";
import { http } from "./http";

export const insightsService = {
  async generate() {
    return http.post(apiEndpoints.creatorInsights.generate);
  },
};
