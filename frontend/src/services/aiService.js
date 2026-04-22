import api from "./api";

/**
 * Call backend AI insights API
 */
export const getAIInsights = async (socialAccountId, token) => {
  const response = await api.post(
    `/ai/insights/${socialAccountId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};