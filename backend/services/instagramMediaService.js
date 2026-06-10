import axios from "axios";

import AppError from "../utils/AppError.js";

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

      console.log(
        "\n================================="
      );

      console.log(
        "INSTAGRAM MEDIA SYNC START"
      );

      console.log(
        "================================="
      );

      /**
       * --------------------------------
       * Fetch Media List
       * --------------------------------
       */

      const mediaList =
        await fetchMediaList(
          accessToken
        );

      console.log(
        "MEDIA FOUND:",
        mediaList.length
      );

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

      console.log(
        "\nSYNC RESULT:"
      );

      console.dir(
        {
          matched:
            result.matchedCount,

          modified:
            result.modifiedCount,

          inserted:
            result.upsertedCount,
        },
        {
          depth: null,
        }
      );

      console.log(
        "\n================================="
      );

      console.log(
        "INSTAGRAM MEDIA SYNC COMPLETE"
      );

      console.log(
        "=================================\n"
      );

      return {

        syncedCount:
          mediaDetails.length,

        insertedCount:
          result.upsertedCount || 0,

        updatedCount:
          result.modifiedCount || 0,
      };

    } catch (error) {

      console.error(
        "\n================================="
      );

      console.error(
        "INSTAGRAM MEDIA SYNC FAILED"
      );

      console.error(
        "================================="
      );

      console.error(
        "MESSAGE:",
        error.message
      );

      console.error(
        "STATUS:",
        error.response?.status
      );

      console.error(
        "DATA:"
      );

      console.dir(
        error.response?.data,
        {
          depth: null,
        }
      );

      console.error(
        "\n=================================\n"
      );

      throw new AppError(
        "Failed to sync Instagram media",
        500
      );
    }
  };