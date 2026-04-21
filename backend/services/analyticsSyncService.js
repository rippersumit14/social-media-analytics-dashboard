/**
 * Generate mock analytics data for a social account.
 * Later this function can be replaced with real Instagram API fetch logic.
 *
 * @param {Object} socialAccount - Connected social account document
 * @returns {Promise<Object>} analytics metrics
 */
export const fetchMockAnalyticsData = async (socialAccount) => {
  // Small helper to generate random integer in a range
  const randomInRange = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Base values can vary slightly by platform in future
  const followers = randomInRange(1000, 5000);
  const following = randomInRange(100, 500);
  const posts = randomInRange(20, 150);
  const likes = randomInRange(200, 2000);
  const comments = randomInRange(20, 200);
  const impressions = randomInRange(5000, 20000);
  const reach = randomInRange(3000, 15000);

  // Simple derived metric for now
  const engagementRate = Number(
    (((likes + comments) / Math.max(followers, 1)) * 100).toFixed(2)
  );

  return {
    socialAccount: socialAccount._id,
    followers,
    following,
    posts,
    likes,
    comments,
    engagementRate,
    impressions,
    reach,
    capturedAt: new Date(),
  };
};