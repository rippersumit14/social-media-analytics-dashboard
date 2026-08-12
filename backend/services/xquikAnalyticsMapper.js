const collectionKeys = [
  "data",
  "tweets",
  "results",
  "items",
];

const likeKeys = [
  "like_count",
  "likeCount",
  "likes",
];

const replyKeys = [
  "reply_count",
  "replyCount",
  "comments",
];

const repostKeys = [
  "retweet_count",
  "retweetCount",
  "reposts",
  "retweets",
];

const quoteKeys = [
  "quote_count",
  "quoteCount",
  "quotes",
];

const viewKeys = [
  "view_count",
  "viewCount",
  "views",
];

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const getMetric = (
  tweet,
  keys
) => {
  const publicMetrics =
    tweet.public_metrics ||
    tweet.publicMetrics ||
    {};

  for (const key of keys) {
    if (tweet[key] !== undefined) {
      return toNumber(tweet[key]);
    }

    if (publicMetrics[key] !== undefined) {
      return toNumber(publicMetrics[key]);
    }
  }

  return 0;
};

export const extractXquikTweets = (payload) => {
  if (typeof payload === "string") {
    return extractXquikTweets(
      JSON.parse(payload)
    );
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  for (const key of collectionKeys) {
    const value = payload[key];

    if (Array.isArray(value)) {
      return value;
    }

    if (value && typeof value === "object") {
      const nested =
        extractXquikTweets(value);

      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
};

export const mapXquikTweetsToDailyEngagement = (payload) => {
  const byDate = new Map();

  extractXquikTweets(payload)
    .forEach((tweet) => {
      const rawDate =
        tweet.created_at ||
        tweet.createdAt ||
        tweet.date;

      if (!rawDate) {
        return;
      }

      const date =
        String(rawDate).slice(0, 10);

      const current =
        byDate.get(date) || {
          date,
          likes: 0,
          comments: 0,
          reposts: 0,
          quotes: 0,
          views: 0,
          engagement: 0,
        };

      const likes =
        getMetric(tweet, likeKeys);

      const comments =
        getMetric(tweet, replyKeys);

      const reposts =
        getMetric(tweet, repostKeys);

      const quotes =
        getMetric(tweet, quoteKeys);

      const views =
        getMetric(tweet, viewKeys);

      current.likes += likes;
      current.comments += comments;
      current.reposts += reposts;
      current.quotes += quotes;
      current.views += views;
      current.engagement +=
        likes + comments + reposts + quotes;

      byDate.set(
        date,
        current
      );
    });

  return [...byDate.values()]
    .sort((left, right) =>
      left.date.localeCompare(right.date)
    );
};

export const buildXquikDashboardSummary = (
  payload,
  options = {}
) => {
  const tweets =
    extractXquikTweets(payload);

  const dailyEngagement =
    mapXquikTweetsToDailyEngagement(tweets);

  const totals =
    dailyEngagement.reduce(
      (summary, day) => {
        summary.likes += day.likes;
        summary.comments += day.comments;
        summary.reposts += day.reposts;
        summary.quotes += day.quotes;
        summary.views += day.views;
        summary.engagement += day.engagement;

        return summary;
      },
      {
        likes: 0,
        comments: 0,
        reposts: 0,
        quotes: 0,
        views: 0,
        engagement: 0,
      }
    );

  const tweetCount =
    tweets.length;

  return {
    source: "xquik",
    account:
      options.account ||
      options.username ||
      null,
    tweetCount,
    dailyEngagement,
    totals,
    averages: {
      likes:
        tweetCount > 0
          ? Math.round(totals.likes / tweetCount)
          : 0,
      comments:
        tweetCount > 0
          ? Math.round(totals.comments / tweetCount)
          : 0,
      engagement:
        tweetCount > 0
          ? Math.round(totals.engagement / tweetCount)
          : 0,
    },
  };
};
