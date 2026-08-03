import { apiEndpoints } from "../api/endpoints";
import { http } from "./http";

export const creatorNewsService = {
  async list({ category = "all", limit = 24 } = {}) {
    const response = await http.get(apiEndpoints.creatorNews.list, {
      params: {
        category,
        limit,
      },
    });

    return response.data || {
      categories: [],
      items: [],
      notifications: [],
      lastRefreshedAt: null,
    };
  },

  async refresh() {
    const response = await http.post(apiEndpoints.creatorNews.refresh);

    return response.data?.results || [];
  },
};
