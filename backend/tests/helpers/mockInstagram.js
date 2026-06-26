/**
 * --------------------------------------------------
 * Mock Instagram Account
 * --------------------------------------------------
 *
 * Fake Instagram profile used
 * across multiple tests.
 */

export const mockInstagramAccount = {

  instagramId: "17841400000000000",

  username: "creator_test",

  accountType: "BUSINESS",

  profilePicture:
    "https://example.com/profile.jpg",

};

/**
 * --------------------------------------------------
 * Mock Media List
 * --------------------------------------------------
 */

export const mockInstagramMedia = [

  {

    id: "media_1",

    mediaType: "IMAGE",

    mediaUrl:
      "https://example.com/image1.jpg",

    caption:
      "Mock Post One",

    likeCount: 125,

    commentsCount: 18,

    timestamp:
      new Date().toISOString(),

  },

  {

    id: "media_2",

    mediaType: "VIDEO",

    mediaUrl:
      "https://example.com/video.mp4",

    caption:
      "Mock Reel",

    likeCount: 240,

    commentsCount: 35,

    timestamp:
      new Date().toISOString(),

  },

];

/**
 * --------------------------------------------------
 * Mock Analytics Snapshot
 * --------------------------------------------------
 */

export const mockAnalyticsSnapshot = {

  followers: 1200,

  following: 320,

  mediaCount: 2,

  totalLikes: 365,

  totalComments: 53,

  totalEngagement: 418,

  averageLikes: 182.5,

  averageComments: 26.5,

  averageEngagement: 209,

  followerGrowth: 12,

  engagementGrowth: 8,

  mediaGrowth: 2,

};

/**
 * --------------------------------------------------
 * Create Custom Analytics Snapshot
 * --------------------------------------------------
 *
 * Allows overriding specific values
 * during testing.
 */

export const createMockSnapshot = (
  overrides = {}
) => {

  return {

    ...mockAnalyticsSnapshot,

    ...overrides,

  };

};

/**
 * --------------------------------------------------
 * Mock Instagram Sync Response
 * --------------------------------------------------
 */

export const mockSyncResponse = {

  success: true,

  syncedMedia: 2,

  skippedMedia: 0,

};

/**
 * --------------------------------------------------
 * Mock Instagram API Error
 * --------------------------------------------------
 */

export const mockInstagramError =
  new Error(
    "Mock Instagram API Failure"
  );