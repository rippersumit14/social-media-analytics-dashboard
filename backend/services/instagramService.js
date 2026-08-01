import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import axios from "axios";

/**
 * --------------------------------------------------
 * Generate Instagram OAuth URL
 * --------------------------------------------------
 *
 * Purpose:
 * Generates Instagram Business Login URL
 * with OAuth state protection.
 */

export const generateInstagramAuthURL = (state) => {
  const {
    INSTAGRAM_APP_ID,
    INSTAGRAM_REDIRECT_URI,
  } = process.env;

  if (
    !INSTAGRAM_APP_ID ||
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
    `https://www.instagram.com/oauth/authorize` +
    `?force_reauth=true` +
    `&client_id=${INSTAGRAM_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(
      INSTAGRAM_REDIRECT_URI
    )}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&state=${state}`;

  logger.info(
    "Instagram OAuth URL generated",
    {
      redirectConfigured:
        Boolean(INSTAGRAM_REDIRECT_URI),
    }
  );

  return authURL;
};


/**
 * --------------------------------------------------
 * Exchange OAuth Code For Access Token
 * --------------------------------------------------
 */

export const exchangeCodeForToken = async (
  code
) => {
  const {
    INSTAGRAM_APP_ID,
    INSTAGRAM_APP_SECRET,
    INSTAGRAM_REDIRECT_URI,
  } = process.env;

  try {
    const payload =
      new URLSearchParams({
        client_id:
          INSTAGRAM_APP_ID,

        client_secret:
          INSTAGRAM_APP_SECRET,

        grant_type:
          "authorization_code",

        redirect_uri:
          INSTAGRAM_REDIRECT_URI,

        code,
      });

    const { data } =
      await axios.post(
        "https://api.instagram.com/oauth/access_token",
        payload,
        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          timeout: 30000,
        }
      );

    return data;

  } catch (error) {

    logger.warn(
      "Instagram token exchange failed",
      {
        status:
          error.response?.status,

        providerError:
          error.response?.data?.error_type ||
          error.response?.data?.error,
      },
    );

    throw new AppError(
      "Instagram token exchange failed",
      502
    );
  }
};



/**
 * --------------------------------------------------
 * Get Instagram Business Account Info
 * --------------------------------------------------
 */

export const getInstagramAccountInfo =
  async (
    accessToken
  ) => {
    try {

      const { data } =
        await axios.get(
          "https://graph.instagram.com/me",
          {
            params: {
              fields:
                "id,username,account_type",

              access_token:
                accessToken,
            },

            timeout: 30000,
          }
        );

      return {
        instagramUserId:
          data.id,

        username:
          data.username,

        accountType:
          data.account_type ===
          "MEDIA_CREATOR"
            ? "creator"
            : "business",

        followers: 0,

        mediaCount: 0,

        pageId: null,

        profileImage: "",
      };

    } catch (error) {

      logger.warn(
        "Instagram profile fetch failed",
        {
          status:
            error.response?.status,

          providerError:
            error.response?.data?.error?.type ||
            error.response?.data?.error,
        },
      );

      throw new AppError(
        "Failed to fetch Instagram profile",
        502
      );
    }
  };
