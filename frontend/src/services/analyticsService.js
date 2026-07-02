import { apiEndpoints } from "../api/endpoints";
import { http } from "./http";

export const analyticsService = {
  async createSnapshot() {
    return http.post(apiEndpoints.instagram.analyticsSnapshot);
  },
};
