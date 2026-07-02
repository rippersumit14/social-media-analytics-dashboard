import { apiEndpoints } from "../api/endpoints";
import { http } from "./http";

export const dashboardService = {
  async getOverview() {
    const response = await http.get(apiEndpoints.dashboard.overview);

    return response.data;
  },
};
