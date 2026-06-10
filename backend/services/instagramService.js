import AppError from "../utils/AppError.js";
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

  console.log("\n=================================");
  console.log("INSTAGRAM AUTH URL GENERATED");
  console.log("=================================");

  console.log(
    "INSTAGRAM_APP_ID:",
    INSTAGRAM_APP_ID
  );

  console.log(
    "INSTAGRAM_REDIRECT_URI:",
    INSTAGRAM_REDIRECT_URI
  );

  console.log(
    "STATE:",
    state
  );

  console.log("AUTH URL:");

  console.log(authURL);

  console.log("=================================\n");

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

    console.log(
      "\n================================="
    );

    console.log(
      "INSTAGRAM TOKEN EXCHANGE FAILED"
    );

    console.log(
      "================================="
    );

    console.dir(
      {
        status:
          error.response?.status,

        data:
          error.response?.data,
      },
      {
        depth: null,
      }
    );

    throw new AppError(
      error.response?.data?.error_message ||
      "Instagram token exchange failed",
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

      console.log(
        "\n================================="
      );

      console.log(
        "INSTAGRAM PROFILE FETCH FAILED"
      );

      console.log(
        "================================="
      );

      console.dir(
        {
          status:
            error.response?.status,

          data:
            error.response?.data,
        },
        {
          depth: null,
        }
      );

      throw new AppError(
        "Failed to fetch Instagram profile",
        500
      );
    }
  };
