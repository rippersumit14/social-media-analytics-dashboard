import axios from "axios";

import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

import InstagramMedia from "../models/InstagramMedia.js";

/**
 * --------------------------------------------------
 * Extract Hashtags
 * --------------------------------------------------
 */

const extractHashtags = (
  caption = ""
) => {

  const hashtags =
    caption.match(
      /#[a-zA-Z0-9_]+/g
    );

  return hashtags || [];
};

/**
 * --------------------------------------------------
 * Fetch Instagram Media List
 * --------------------------------------------------
 */

const fetchMediaList = async (
  accessToken
) => {

  const {
    data,
  } = await axios.get(
    "https://graph.instagram.com/me/media",
    {
      params: {
        fields: "id",
        access_token:
          accessToken,
      },

      timeout: 30000,
    }
  );

  return data?.data || [];
};

/**
 * --------------------------------------------------
 * Fetch Media Details
 * --------------------------------------------------
 */

const fetchMediaDetails = async (
  mediaId,
  accessToken
) => {

  const {
    data,
  } = await axios.get(
    `https://graph.instagram.com/${mediaId}`,
    {
      params: {
        fields: [
          "id",
          "caption",
          "media_type",
          "media_url",
          "thumbnail_url",
          "permalink",
          "timestamp",
        ].join(","),

        access_token:
          accessToken,
      },

      timeout: 30000,
    }
  );

  return data;
};

/**
 * --------------------------------------------------
 * Transform Media
 * --------------------------------------------------
 */

const transformMedia = (
  media,
  instagramAccountId
) => {

  const caption =
    media.caption || "";

  return {

    instagramAccount:
      instagramAccountId,

    mediaId:
      media.id,

    mediaType:
      media.media_type,

    productType:
      "",

    caption,

    hashtags:
      extractHashtags(
        caption
      ),

    mediaUrl:
      media.media_url || "",

    thumbnailUrl:
      media.thumbnail_url || "",

    permalink:
      media.permalink || "",

    shortcode:
      "",

    postedAt:
      media.timestamp,

    syncedAt:
      new Date(),

    isDeleted:
      false,
  };
};

/**
 * --------------------------------------------------
 * Sync Instagram Media
 * --------------------------------------------------
 *
 * Flow
 *
 * Access Token
 *      ↓
 * Fetch Media IDs
 *      ↓
 * Fetch Details
 *      ↓
 * Transform
 *      ↓
 * Bulk Upsert
 *      ↓
 * Mongo
 */

export const syncInstagramMedia =
  async ({
    instagramAccountId,
    accessToken,
  }) => {

    try {

      /**
       * --------------------------------
       * Fetch Media List
       * --------------------------------
       */

      const mediaList =
        await fetchMediaList(
          accessToken
        );

      logger.info("Instagram media sync started", {
        instagramAccountId:
          instagramAccountId.toString(),
        mediaFound:
          mediaList.length,
      });

      if (
        mediaList.length === 0
      ) {

        return {
          syncedCount: 0,
          insertedCount: 0,
          updatedCount: 0,
        };
      }

      /**
       * --------------------------------
       * Fetch Details
       * --------------------------------
       */

      const mediaDetails =
        await Promise.all(

          mediaList.map(
            (media) =>
              fetchMediaDetails(
                media.id,
                accessToken
              )
          )
        );

      /**
       * --------------------------------
       * Prepare Bulk Operations
       * --------------------------------
       */

      const operations =
        mediaDetails.map(
          (
            media
          ) => {

            const normalized =
              transformMedia(
                media,
                instagramAccountId
              );

            return {

              updateOne: {

                filter: {
                  mediaId:
                    normalized.mediaId,
                },

                update: {
                  $set:
                    normalized,
                },

                upsert: true,
              },
            };
          }
        );

      /**
       * --------------------------------
       * Bulk Write
       * --------------------------------
       */

      const result =
        await InstagramMedia.bulkWrite(
          operations,
          {
            ordered:
              false,
          }
        );

      logger.info("Instagram media sync completed", {
        instagramAccountId:
          instagramAccountId.toString(),
        matched:
          result.matchedCount,
        modified:
          result.modifiedCount,
        inserted:
          result.upsertedCount || 0,
      });

      return {

        syncedCount:
          mediaDetails.length,

        insertedCount:
          result.upsertedCount || 0,

        updatedCount:
          result.modifiedCount || 0,
      };

    } catch (error) {

      logger.warn("Instagram media sync failed", {
        instagramAccountId:
          instagramAccountId.toString(),
        status:
          error.response?.status,
        providerError:
          error.response?.data?.error?.type ||
          error.response?.data?.error,
      });

      throw new AppError(
        "Failed to sync Instagram media",
        500
      );
    }
  };
