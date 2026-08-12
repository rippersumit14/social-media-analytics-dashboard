import {
  buildXquikDashboardSummary,
  mapXquikTweetsToDailyEngagement,
} from "../../../services/xquikAnalyticsMapper.js";

describe("xquikAnalyticsMapper", () => {
  it("maps Xquik tweet search responses into daily engagement rows", () => {
    const rows =
      mapXquikTweetsToDailyEngagement({
        data: [
          {
            created_at: "2026-07-04T09:00:00Z",
            public_metrics: {
              like_count: 12,
              reply_count: 3,
              retweet_count: 2,
              quote_count: 1,
              view_count: 100,
            },
          },
          {
            created_at: "2026-07-04T12:00:00Z",
            like_count: 8,
            reply_count: 2,
            retweet_count: 1,
            quote_count: 0,
            view_count: 50,
          },
        ],
      });

    expect(rows).toEqual([
      {
        date: "2026-07-04",
        likes: 20,
        comments: 5,
        reposts: 3,
        quotes: 1,
        views: 150,
        engagement: 29,
      },
    ]);
  });

  it("builds a dashboard summary from Xquik data", () => {
    const summary =
      buildXquikDashboardSummary(
        {
          tweets: [
            {
              createdAt: "2026-07-04T09:00:00Z",
              likeCount: 10,
              replyCount: 2,
              retweetCount: 1,
            },
            {
              createdAt: "2026-07-05T09:00:00Z",
              likeCount: 4,
              replyCount: 1,
              quoteCount: 1,
            },
          ],
        },
        {
          username: "example",
        }
      );

    expect(summary).toMatchObject({
      source: "xquik",
      account: "example",
      tweetCount: 2,
      totals: {
        likes: 14,
        comments: 3,
        reposts: 1,
        quotes: 1,
        views: 0,
        engagement: 19,
      },
      averages: {
        likes: 7,
        comments: 2,
        engagement: 10,
      },
    });
  });
});
