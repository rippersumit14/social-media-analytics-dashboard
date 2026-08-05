import axios from "axios";
import { XMLParser } from "fast-xml-parser";

import cloudinary, {
  getMissingCloudinaryEnvVars,
} from "../config/cloudinary.js";
import CreatorNewsItem from "../models/CreatorNewsItem.js";
import logger from "../utils/logger.js";

export const creatorNewsCategories = [
  {
    id: "creator-economy",
    label: "Creator Economy",
    query:
      '"creator economy" OR "content creator" OR "creator monetization"',
  },
  {
    id: "instagram",
    label: "Instagram Creators",
    query:
      '"Instagram creators" OR "Instagram Reels" OR "Instagram creator"',
  },
  {
    id: "influencer-marketing",
    label: "Influencer Marketing",
    query:
      '"influencer marketing" OR "brand partnership" OR "creator partnership"',
  },
  {
    id: "ai-tools",
    label: "AI Tools",
    query:
      '"AI tools for creators" OR "generative AI creators" OR "AI content tools"',
  },
  {
    id: "platform-updates",
    label: "Platform Updates",
    query:
      '"social media platform updates" OR "Instagram algorithm" OR "creator platform"',
  },
];

const GDELT_ENDPOINT =
  "https://api.gdeltproject.org/api/v2/doc/doc";

const COVER_IMAGE_FETCH_LIMIT =
  Number(process.env.CREATOR_NEWS_COVER_FETCH_LIMIT) || 1;

const SHOULD_UPLOAD_COVER_IMAGES =
  process.env.CREATOR_NEWS_UPLOAD_IMAGES === "true";

const CREATOR_NEWS_IMAGE_FOLDER =
  process.env.CREATOR_NEWS_IMAGE_FOLDER ||
  "creator-growth/news-covers";

const rssParser = new XMLParser({
  ignoreAttributes:
    false,
  attributeNamePrefix:
    "",
  textNodeName:
    "text",
});

const creatorNewsFeeds = [
  {
    category:
      "creator-economy",
    name:
      "Google News Creator Economy",
    url:
      "https://news.google.com/rss/search?q=creator%20economy&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "creator-economy",
    name:
      "Google News Content Creators",
    url:
      "https://news.google.com/rss/search?q=content%20creator%20business&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "creator-economy",
    name:
      "Google News Creator Monetization",
    url:
      "https://news.google.com/rss/search?q=creator%20monetization&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "creator-economy",
    name:
      "Google News Creator Startups",
    url:
      "https://news.google.com/rss/search?q=creator%20economy%20startup&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "instagram",
    name:
      "Google News Instagram Creators",
    url:
      "https://news.google.com/rss/search?q=Instagram%20creators&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "instagram",
    name:
      "Google News Instagram Reels",
    url:
      "https://news.google.com/rss/search?q=Instagram%20Reels%20creator&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "instagram",
    name:
      "Google News Instagram Algorithm",
    url:
      "https://news.google.com/rss/search?q=Instagram%20algorithm%20creators&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "instagram",
    name:
      "Google News Instagram Business",
    url:
      "https://news.google.com/rss/search?q=Instagram%20business%20creator%20tools&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "influencer-marketing",
    name:
      "Google News Influencer Marketing",
    url:
      "https://news.google.com/rss/search?q=influencer%20marketing&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "influencer-marketing",
    name:
      "Google News Brand Partnerships",
    url:
      "https://news.google.com/rss/search?q=brand%20partnerships%20creators&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "influencer-marketing",
    name:
      "Google News Creator Sponsorships",
    url:
      "https://news.google.com/rss/search?q=creator%20sponsorships&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "influencer-marketing",
    name:
      "Google News Influencer Campaigns",
    url:
      "https://news.google.com/rss/search?q=influencer%20campaigns%20social%20media&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "ai-tools",
    name:
      "Google News AI Creator Tools",
    url:
      "https://news.google.com/rss/search?q=AI%20tools%20for%20creators&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "ai-tools",
    name:
      "Google News Generative AI Content",
    url:
      "https://news.google.com/rss/search?q=generative%20AI%20content%20creation&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "ai-tools",
    name:
      "Google News AI Video Tools",
    url:
      "https://news.google.com/rss/search?q=AI%20video%20tools%20creators&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "ai-tools",
    name:
      "Google News AI Social Media",
    url:
      "https://news.google.com/rss/search?q=AI%20social%20media%20tools&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "platform-updates",
    name:
      "Google News Social Platform Updates",
    url:
      "https://news.google.com/rss/search?q=social%20media%20platform%20updates&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "platform-updates",
    name:
      "Google News TikTok Creators",
    url:
      "https://news.google.com/rss/search?q=TikTok%20creators%20platform%20updates&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "platform-updates",
    name:
      "Google News YouTube Creators",
    url:
      "https://news.google.com/rss/search?q=YouTube%20creators%20platform%20updates&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "platform-updates",
    name:
      "Google News LinkedIn Creators",
    url:
      "https://news.google.com/rss/search?q=LinkedIn%20creators%20platform%20updates&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "creator-economy",
    name:
      "Google News Creator Business",
    url:
      "https://news.google.com/rss/search?q=creator%20business%20newsletter&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "creator-economy",
    name:
      "Google News Creator Platforms",
    url:
      "https://news.google.com/rss/search?q=creator%20platform%20economy&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "creator-economy",
    name:
      "Google News Creator Subscriptions",
    url:
      "https://news.google.com/rss/search?q=creator%20subscriptions%20membership&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "creator-economy",
    name:
      "Google News Creator Funding",
    url:
      "https://news.google.com/rss/search?q=creator%20economy%20funding&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "creator-economy",
    name:
      "Google News Creator Tools",
    url:
      "https://news.google.com/rss/search?q=creator%20tools%20startup&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "creator-economy",
    name:
      "Google News Content Strategy",
    url:
      "https://news.google.com/rss/search?q=content%20strategy%20creators&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "creator-economy",
    name:
      "Google News Creator Revenue",
    url:
      "https://news.google.com/rss/search?q=creator%20revenue%20business&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "creator-economy",
    name:
      "Google News Creator Analytics",
    url:
      "https://news.google.com/rss/search?q=creator%20analytics%20tools&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "instagram",
    name:
      "Google News Instagram Growth",
    url:
      "https://news.google.com/rss/search?q=Instagram%20growth%20creators&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "instagram",
    name:
      "Google News Instagram Insights",
    url:
      "https://news.google.com/rss/search?q=Instagram%20insights%20business%20creators&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "instagram",
    name:
      "Google News Instagram Monetization",
    url:
      "https://news.google.com/rss/search?q=Instagram%20monetization%20creators&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "instagram",
    name:
      "Google News Instagram Shopping",
    url:
      "https://news.google.com/rss/search?q=Instagram%20shopping%20creators&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "instagram",
    name:
      "Google News Instagram Creator Marketplace",
    url:
      "https://news.google.com/rss/search?q=Instagram%20creator%20marketplace&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "instagram",
    name:
      "Google News Instagram Professional Dashboard",
    url:
      "https://news.google.com/rss/search?q=Instagram%20professional%20dashboard%20creators&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "influencer-marketing",
    name:
      "Google News Influencer ROI",
    url:
      "https://news.google.com/rss/search?q=influencer%20marketing%20ROI&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "influencer-marketing",
    name:
      "Google News Micro Influencers",
    url:
      "https://news.google.com/rss/search?q=micro%20influencer%20marketing&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "influencer-marketing",
    name:
      "Google News Creator Partnerships",
    url:
      "https://news.google.com/rss/search?q=creator%20brand%20partnerships&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "influencer-marketing",
    name:
      "Google News Creator Agencies",
    url:
      "https://news.google.com/rss/search?q=creator%20agency%20influencer%20marketing&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "influencer-marketing",
    name:
      "Google News Social Commerce Creators",
    url:
      "https://news.google.com/rss/search?q=social%20commerce%20creators%20influencers&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "influencer-marketing",
    name:
      "Google News Creator Campaigns",
    url:
      "https://news.google.com/rss/search?q=creator%20campaigns%20brands&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "ai-tools",
    name:
      "Google News AI Creator Workflow",
    url:
      "https://news.google.com/rss/search?q=AI%20creator%20workflow&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "ai-tools",
    name:
      "Google News AI Design Tools",
    url:
      "https://news.google.com/rss/search?q=AI%20design%20tools%20creators&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "ai-tools",
    name:
      "Google News AI Editing Tools",
    url:
      "https://news.google.com/rss/search?q=AI%20video%20editing%20tools%20creators&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "ai-tools",
    name:
      "Google News AI Marketing Tools",
    url:
      "https://news.google.com/rss/search?q=AI%20marketing%20tools%20creators&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "ai-tools",
    name:
      "Google News AI Short Form Video",
    url:
      "https://news.google.com/rss/search?q=AI%20short%20form%20video%20creators&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "ai-tools",
    name:
      "Google News AI Creator Automation",
    url:
      "https://news.google.com/rss/search?q=AI%20creator%20automation&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "platform-updates",
    name:
      "Google News YouTube Shorts Creators",
    url:
      "https://news.google.com/rss/search?q=YouTube%20Shorts%20creators%20updates&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "platform-updates",
    name:
      "Google News TikTok Creator Tools",
    url:
      "https://news.google.com/rss/search?q=TikTok%20creator%20tools%20updates&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "platform-updates",
    name:
      "Google News LinkedIn Creator Mode",
    url:
      "https://news.google.com/rss/search?q=LinkedIn%20creator%20tools%20updates&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "platform-updates",
    name:
      "Google News Social Algorithms",
    url:
      "https://news.google.com/rss/search?q=social%20media%20algorithm%20updates%20creators&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "platform-updates",
    name:
      "Google News Creator Policy Updates",
    url:
      "https://news.google.com/rss/search?q=creator%20platform%20policy%20updates&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "platform-updates",
    name:
      "Google News Social Media Trends",
    url:
      "https://news.google.com/rss/search?q=social%20media%20trends%20creators&hl=en-US&gl=US&ceid=US:en",
  },
  {
    category:
      "creator-economy",
    name:
      "TechCrunch Social",
    url:
      "https://techcrunch.com/category/social/feed/",
  },
  {
    category:
      "platform-updates",
    name:
      "The Verge",
    url:
      "https://www.theverge.com/rss/index.xml",
  },
  {
    category:
      "ai-tools",
    name:
      "VentureBeat AI",
    url:
      "https://venturebeat.com/category/ai/feed/",
  },
  {
    category:
      "platform-updates",
    name:
      "Social Media Today",
    url:
      "https://www.socialmediatoday.com/feeds/news/",
  },
];

const sanitizeText = (value = "") =>
  String(value)
    .replace(/\s+/g, " ")
    .trim();

const truncateText = (value, maxLength) => {
  const text =
    sanitizeText(value);

  return text.length > maxLength
    ? `${text.slice(0, maxLength - 1)}...`
    : text;
};

const stripHtml = (value = "") =>
  sanitizeText(
    String(value)
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'")
  );

const decodeHtmlAttribute = (value = "") =>
  String(value)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const toArray = (value) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value)
    ? value
    : [value];
};

const parseGdeltDate = (value) => {
  if (!value) {
    return null;
  }

  const compactMatch =
    String(value).match(
      /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/
    );

  if (compactMatch) {
    const [
      ,
      year,
      month,
      day,
      hour,
      minute,
      second,
    ] = compactMatch;

    return new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
      )
    );
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? null
    : parsed;
};

const toAbsoluteUrl = (value, baseUrl) => {
  if (!value) {
    return "";
  }

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return "";
  }
};

const extractMetaImage = (html, pageUrl) => {
  const metaPatterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i,
    /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  ];

  for (const pattern of metaPatterns) {
    const match =
      html.match(pattern);

    if (match?.[1]) {
      return toAbsoluteUrl(
        decodeHtmlAttribute(match[1]),
        pageUrl
      );
    }
  }

  return "";
};

const uploadCoverImage = async (imageUrl) => {
  if (
    !SHOULD_UPLOAD_COVER_IMAGES ||
    getMissingCloudinaryEnvVars().length > 0
  ) {
    return imageUrl;
  }

  try {
    const uploadResult =
      await cloudinary.uploader.upload(
        imageUrl,
        {
          folder:
            CREATOR_NEWS_IMAGE_FOLDER,
          overwrite:
            false,
          unique_filename:
            true,
          resource_type:
            "image",
        }
      );

    return uploadResult.secure_url || imageUrl;
  } catch (error) {
    logger.warn(
      "Creator news cover upload failed",
      {
        message:
          error.message,
      }
    );

    return imageUrl;
  }
};

const fetchArticleCoverImage = async (item) => {
  if (item.imageUrl || !item.url) {
    return item.imageUrl || "";
  }

  try {
    const response =
      await axios.get(item.url, {
        timeout:
          7000,
        responseType:
          "text",
        maxContentLength:
          800000,
        headers: {
          "User-Agent":
            "CreatorIQ-NewsBot/1.0",
          Accept:
            "text/html,application/xhtml+xml",
        },
      });

    const coverImage =
      extractMetaImage(
        response.data,
        item.url
      );

    return coverImage
      ? uploadCoverImage(coverImage)
      : "";
  } catch (error) {
    logger.warn(
      "Creator news cover extraction failed",
      {
        source:
          item.sourceName,
        message:
          error.message,
      }
    );

    return "";
  }
};

const enrichNewsImages = async (items) => {
  let coverFetches =
    0;

  const enrichedItems = [];

  for (const item of items) {
    if (
      !item.imageUrl &&
      coverFetches < COVER_IMAGE_FETCH_LIMIT
    ) {
      coverFetches += 1;

      const coverImage =
        await fetchArticleCoverImage(item);

      enrichedItems.push({
        ...item,
        imageUrl:
          coverImage || item.imageUrl,
      });

      continue;
    }

    if (item.imageUrl && SHOULD_UPLOAD_COVER_IMAGES) {
      enrichedItems.push({
        ...item,
        imageUrl:
          await uploadCoverImage(item.imageUrl),
      });

      continue;
    }

    enrichedItems.push(item);
  }

  return enrichedItems;
};

const toNewsItem = (article, category) => {
  const title =
    sanitizeText(article.title);

  if (!title || !article.url) {
    return null;
  }

  return {
    title:
      truncateText(title, 240),
    summary:
      truncateText(sanitizeText(article.seendate
        ? `A current creator-market story surfaced by ${article.domain || "GDELT"}.`
        : "A current creator-market story from the public news index."), 600),
    url:
      article.url,
    imageUrl:
      article.socialimage || "",
    sourceName:
      truncateText(article.domain || "GDELT", 120),
    category,
    publishedAt:
      parseGdeltDate(article.seendate),
    fetchedAt:
      new Date(),
    sourceApi:
      "gdelt-doc-2",
  };
};

const getRssImage = (item) => {
  const enclosure =
    toArray(item.enclosure)[0];

  if (enclosure?.url) {
    return enclosure.url;
  }

  const mediaContent =
    item["media:content"] || item.content;

  if (Array.isArray(mediaContent)) {
    return mediaContent.find((entry) => entry?.url)?.url || "";
  }

  if (mediaContent?.url) {
    return mediaContent.url;
  }

  const mediaThumbnail =
    item["media:thumbnail"];

  if (Array.isArray(mediaThumbnail)) {
    return mediaThumbnail.find((entry) => entry?.url)?.url || "";
  }

  return mediaThumbnail?.url || "";
};

const getRssSourceName = (item, feed) => {
  if (typeof item.source === "string") {
    return sanitizeText(item.source);
  }

  return sanitizeText(
    item.source?.text ||
      item.source?.["#text"] ||
      item.source?.url ||
      feed.name
  );
};

const getRssUrl = (item) => {
  if (typeof item.link === "string") {
    return item.link;
  }

  if (Array.isArray(item.link)) {
    return item.link.find((link) => link?.href)?.href || "";
  }

  return item.link?.href ||
    item.guid?.text ||
    item.guid?.["#text"] ||
    (typeof item.guid === "string" ? item.guid : "");
};

const getRssTitle = (item) =>
  sanitizeText(
    item.title?.text ||
      item.title?.["#text"] ||
      item.title ||
      ""
  );

const getRssPublishedAt = (item) => {
  const value =
    item.pubDate ||
    item.published ||
    item.updated ||
    item["dc:date"];

  const parsed =
    new Date(value);

  return Number.isNaN(parsed.getTime())
    ? null
    : parsed;
};

const getRssSummary = (item, feedName) => {
  const summary =
    item.description ||
    item.summary ||
    item.content ||
    item["content:encoded"];

  const cleaned =
    stripHtml(
      summary?.text ||
        summary?.["#text"] ||
        summary ||
        ""
    );

  return cleaned ||
    `A creator-market update from ${feedName}.`;
};

const toRssNewsItem = (item, feed) => {
  const title =
    getRssTitle(item);

  const url =
    getRssUrl(item);

  if (!title || !url) {
    return null;
  }

  return {
    title:
      truncateText(title, 240),
    summary:
      truncateText(
        getRssSummary(
          item,
          feed.name
        ),
        600
      ),
    url,
    imageUrl:
      getRssImage(item),
    sourceName:
      truncateText(
        getRssSourceName(
          item,
          feed
        ),
        120
      ),
    category:
      feed.category,
    publishedAt:
      getRssPublishedAt(item),
    fetchedAt:
      new Date(),
    sourceApi:
      "public-rss",
  };
};

const persistCreatorNewsItems = async (items) => {
  const operations =
    items.map((item) => ({
      updateOne: {
        filter: {
          url:
            item.url,
        },
        update: {
          $set:
            item,
        },
        upsert:
          true,
      },
    }));

  if (operations.length > 0) {
    await CreatorNewsItem.bulkWrite(
      operations,
      {
        ordered: false,
      }
    );
  }
};

export const refreshCreatorNewsCategory = async (categoryConfig) => {
  const response =
    await axios.get(
      GDELT_ENDPOINT,
      {
        timeout: 12000,
        params: {
          query:
            `${categoryConfig.query} sourcecountry:US`,
          mode:
            "ArtList",
          format:
            "json",
          maxrecords:
            12,
          sort:
            "HybridRel",
        },
      }
    );

  const articles =
    Array.isArray(response.data?.articles)
      ? response.data.articles
      : [];

  const normalizedItems =
    articles
      .map((article) =>
        toNewsItem(
          article,
          categoryConfig.id
        )
      )
      .filter(Boolean);

  const enrichedItems =
    await enrichNewsImages(
      normalizedItems
    );

  await persistCreatorNewsItems(
    enrichedItems
  );

  return {
    category:
      categoryConfig.id,
    fetched:
      enrichedItems.length,
  };
};

export const refreshCreatorNewsFeed = async (feed) => {
  const response =
    await axios.get(feed.url, {
      timeout:
        9000,
      responseType:
        "text",
      headers: {
        "User-Agent":
          "CreatorIQ-NewsBot/1.0",
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
    });

  const parsed =
    rssParser.parse(response.data);

  const entries =
    toArray(parsed.rss?.channel?.item)
      .concat(toArray(parsed.feed?.entry))
      .slice(0, 8);

  const normalizedItems =
    entries
      .map((item) =>
        toRssNewsItem(
          item,
          feed
        )
      )
      .filter(Boolean);

  const enrichedItems =
    await enrichNewsImages(
      normalizedItems
    );

  await persistCreatorNewsItems(
    enrichedItems
  );

  return {
    source:
      feed.name,
    category:
      feed.category,
    fetched:
      enrichedItems.length,
  };
};

export const refreshCreatorNews = async () => {
  const results = [];

  const categoryResults =
    await Promise.allSettled(
      creatorNewsCategories.map((category) =>
        refreshCreatorNewsCategory(category)
      )
    );

  categoryResults.forEach((result, index) => {
    const category =
      creatorNewsCategories[index];

    if (result.status === "fulfilled") {
      results.push(result.value);
      return;
    }

      logger.warn(
        "Creator news category refresh failed",
        {
          category:
            category.id,
          message:
            result.reason?.message,
        }
      );

      results.push({
        category:
          category.id,
        fetched:
          0,
        error:
          true,
      });
  });

  const feedResults =
    await Promise.allSettled(
      creatorNewsFeeds.map((feed) =>
        refreshCreatorNewsFeed(feed)
      )
    );

  feedResults.forEach((result, index) => {
    const feed =
      creatorNewsFeeds[index];

    if (result.status === "fulfilled") {
      results.push(result.value);
      return;
    }

    logger.warn(
      "Creator news feed refresh failed",
      {
        source:
          feed.name,
        category:
          feed.category,
        message:
          result.reason?.message,
      }
    );

    results.push({
      source:
        feed.name,
      category:
        feed.category,
      fetched:
        0,
      error:
        true,
    });
  });

  return results;
};

const ensureCreatorNewsCache = async () => {
  const existingCount =
    await CreatorNewsItem.estimatedDocumentCount();

  if (existingCount > 0) {
    return false;
  }

  await refreshCreatorNews();

  return true;
};

export const getCreatorNews = async ({
  category,
  limit = 24,
}) => {
  await ensureCreatorNewsCache();

  const allowedCategoryIds =
    creatorNewsCategories.map(
      (item) => item.id
    );

  const query = {};

  if (
    category &&
    category !== "all" &&
    allowedCategoryIds.includes(category)
  ) {
    query.category = category;
  }

  const safeLimit =
    Math.min(
      Math.max(Number(limit) || 24, 1),
      120
    );

  const items =
    query.category
      ? await CreatorNewsItem.find(query)
        .sort({
          publishedAt: -1,
          fetchedAt: -1,
        })
        .limit(safeLimit)
      : (
        await Promise.all(
          allowedCategoryIds.map((categoryId) =>
            CreatorNewsItem.find({
              category:
                categoryId,
            })
              .sort({
                publishedAt: -1,
                fetchedAt: -1,
              })
              .limit(
                Math.max(
                  Math.ceil(safeLimit / allowedCategoryIds.length),
                  12
                )
              )
          )
        )
      )
        .flat()
        .sort((a, b) => {
          const first =
            new Date(a.publishedAt || a.fetchedAt).getTime();
          const second =
            new Date(b.publishedAt || b.fetchedAt).getTime();

          return second - first;
        })
        .slice(0, safeLimit);

  const categoryCounts =
    await CreatorNewsItem.aggregate([
      {
        $group: {
          _id:
            "$category",
          count: {
            $sum:
              1,
          },
        },
      },
    ]);

  const latest =
    await CreatorNewsItem.findOne({})
      .sort({
        fetchedAt: -1,
      })
      .select("fetchedAt");

  const todayCount =
    await CreatorNewsItem.countDocuments({
      fetchedAt: {
        $gte:
          new Date(
            Date.now() - 24 * 60 * 60 * 1000
          ),
      },
    });

  return {
    categories:
      creatorNewsCategories.map(({ id, label }) => ({
        id,
        label,
        count:
          categoryCounts.find((item) => item._id === id)?.count || 0,
      })),
    items,
    sourceCount:
      creatorNewsFeeds.length + creatorNewsCategories.length,
    notifications: [
      {
        type: "daily-update",
        title: "Daily creator market brief",
        message:
          todayCount > 0
            ? `${todayCount} creator-market update${todayCount === 1 ? "" : "s"} refreshed in the last 24 hours.`
            : "No fresh creator-market updates are cached yet. Use refresh or wait for the daily automation.",
      },
    ],
    lastRefreshedAt:
      latest?.fetchedAt || null,
  };
};
