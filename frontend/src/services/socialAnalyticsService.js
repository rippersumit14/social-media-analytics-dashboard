import api from "./api.js";

/**
 * Get all connected social accounts for the logged-in user
 */
export const getSocialAccounts = async (token) => {
  const response = await api.get("/social-accounts", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/**
 * Trigger sync for one social account
 */
export const syncSocialAccount = async (accountId, token) => {
  const response = await api.post(
    `/social-accounts/${accountId}/sync`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

/**
 * Get analytics snapshots for one social account
 */
export const getAnalyticsSnapshots = async (accountId, token) => {
  const response = await api.get(`/analytics-snapshots/${accountId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};