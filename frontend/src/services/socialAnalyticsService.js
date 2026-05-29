import api from "./api.js";

/**
 * Normalize backend response safely.
 */
const normalizeResponse = (
  responseData = {}
) => {
  return {
    /**
     * Accounts API returns:
     * {
     *   count,
     *   accounts
     * }
     */
    accounts:
      responseData.accounts ||
      [],

    /**
     * Analytics API may return:
     * {
     *   snapshots
     * }
     */
    snapshots:
      responseData.snapshots ||
      [],

    /**
     * Generic message.
     */
    message:
      responseData.message ||
      "",

    /**
     * Success fallback.
     */
    success: true,

    /**
     * Raw response.
     */
    data: responseData,
  };
};

/**
 * Get all connected social accounts.
 */
export const getSocialAccounts =
  async ({
    signal,
  } = {}) => {
    const response =
      await api.get(
        "/social-accounts",
        {
          signal,
        }
      );

    return normalizeResponse(
      response.data
    );
  };

/**
 * Trigger sync for one social account.
 */
export const syncSocialAccount =
  async ({
    accountId,
    signal,
  }) => {
    const response =
      await api.post(
        `/social-accounts/${accountId}/sync`,
        {},
        {
          signal,
        }
      );

    return normalizeResponse(
      response.data
    );
  };

/**
 * Get analytics snapshots.
 */
export const getAnalyticsSnapshots =
  async ({
    socialAccountId,
    signal,
  }) => {
    const response =
      await api.get(
        `/analytics-snapshots/${socialAccountId}`,
        {
          signal,
        }
      );

    return normalizeResponse(
      response.data
    );
  };