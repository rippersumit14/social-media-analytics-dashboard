import { apiEndpoints } from "../api/endpoints";
import { http } from "./http";

export const recommendationService = {
  async list() {
    const response = await http.get(apiEndpoints.recommendations.list);

    return response.data || [];
  },

  async generate() {
    const response = await http.post(apiEndpoints.recommendations.generate);

    return response.data?.recommendations || [];
  },
};
