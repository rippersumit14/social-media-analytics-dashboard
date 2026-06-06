import AppError from "../utils/AppError.js";

import axios from "axios";

/**
 * --------------------------------------------------
 * Generate Instagram OAuth URL
 * --------------------------------------------------
 *
 * Includes:
 * OAuth state parameter
 *
 * Used to securely map the
 * callback request back to
 * the authenticated user.
 *
 */

export const generateInstagramAuthURL = (
  state
) => {

  const {
    META_APP_ID,
    INSTAGRAM_REDIRECT_URI,
    META_GRAPH_VERSION,
  } = process.env;

  if (
    !META_APP_ID ||
    !INSTAGRAM_REDIRECT_URI
  ) {
    throw new AppError(
      "Instagram OAuth configuration is missing",
      500
    );
  }

  const scopes = [
    "instagram_business_basic",
    "instagram_business_manage_messages",
    "instagram_business_manage_comments",
    "instagram_business_content_publish",
    "instagram_business_manage_insights",
  ].join(",");

  const authURL =
    `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth` +
    `?client_id=${META_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(
      INSTAGRAM_REDIRECT_URI
    )}` +
    `&scope=${scopes}` +
    `&response_type=code` +
    `&state=${state}`;

  return authURL;
};

/**
 * --------------------------------------------------
 * Exchange OAuth Code For Access Token
 * --------------------------------------------------
 */

export const exchangeCodeForToken =
  async (code) => {

    const {
      META_APP_ID,
      META_APP_SECRET,
      INSTAGRAM_REDIRECT_URI,
      META_GRAPH_VERSION,
    } = process.env;

    try {

      const url =
        `https://graph.facebook.com/${META_GRAPH_VERSION}/oauth/access_token`;

      const { data } =
        await axios.get(url, {
          params: {
            client_id:
              META_APP_ID,

            client_secret:
              META_APP_SECRET,

            redirect_uri:
              INSTAGRAM_REDIRECT_URI,

            code,
          },
        });

      return data;

    } catch (error) {

      throw new AppError(
        "Failed to exchange code for access token",
        500
      );
    }
  };

  
/**
 * --------------------------------------------------
 * Get Instagram Business Account Info
 * --------------------------------------------------
 */

export const getInstagramAccountInfo =
  async (accessToken) => {

    try {

      /**
       * Step 1
       * Get Facebook Pages
       */

      const { data: pagesData } =
        await axios.get(
          "https://graph.facebook.com/me/accounts",
          {
            params: {
              access_token:
                accessToken,
            },
          }
        );

      if (
        !pagesData.data ||
        pagesData.data.length === 0
      ) {
        throw new AppError(
          "No Facebook page connected",
          400
        );
      }

      const page =
        pagesData.data[0];

      /**
       * Step 2
       * Get Instagram Business Accoun
       */

      const {
        data: instagramData,
      } = await axios.get(
        `https://graph.facebook.com/${page.id}`,
        {
          params: {
            fields:
              "instagram_business_account",

            access_token:
              accessToken,
          },
        }
      );

      const instagramId =
        instagramData
          ?.instagram_business_account
          ?.id;

      if (!instagramId) {
        throw new AppError(
          "No Instagram business account linked",
          400
        );
      }

      /**
       * Step 3
       * Get Instagram Profile
       */

      const {
        data: profileData,
      } = await axios.get(
        `https://graph.facebook.com/${instagramId}`,
        {
          params: {
            fields:
              "id,username,followers_count,media_count,profile_picture_url",

            access_token:
              accessToken,
          },
        }
      );

      return {
        pageId:
          page.id,

        instagramUserId:
          profileData.id,

        username:
          profileData.username,

        followers:
          profileData.followers_count || 0,

        mediaCount:
          profileData.media_count || 0,

        profileImage:
          profileData.profile_picture_url || "",
      };

    } catch (error) {

      throw new AppError(
        "Failed to fetch Instagram account information",
        500
      );
    }
  };


