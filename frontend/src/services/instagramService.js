import { apiEndpoints } from "../api/endpoints";
import { http } from "./http";

function extractAccountFromOverview(overview) {
  return overview?.account || null;
}

function extractAuthUrl(response) {
  return response?.data?.authURL;
}

export const instagramService = {
  async getConnectedAccount() {
    try {
      const response = await http.get(apiEndpoints.instagram.accountStatus);

      return {
        account: extractAccountFromOverview(response.data),
        overview: response.data,
      };
    } catch (error) {
      if (error?.response?.status === 404) {
        return {
          account: null,
          overview: null,
        };
      }

      throw error;
    }
  },

  async getConnectionUrl() {
    const response = await http.get(apiEndpoints.instagram.connect);
    const authURL = extractAuthUrl(response);

    if (!authURL) {
      throw new Error("Instagram connection response did not include an authorization URL.");
    }

    return {
      authURL,
      message: response.message,
    };
  },

  async syncMedia() {
    return http.post(apiEndpoints.instagram.mediaSync);
  },

  async createAnalyticsSnapshot() {
    return http.post(apiEndpoints.instagram.analyticsSnapshot);
  },

  async syncCreatorData() {
    const mediaResponse = await instagramService.syncMedia();
    const snapshotResponse = await instagramService.createAnalyticsSnapshot();

    return {
      media: mediaResponse.data,
      snapshot: snapshotResponse.data,
      message: mediaResponse.message || snapshotResponse.message,
    };
  },
};
