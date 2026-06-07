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
    META_GRAPH_VERSION,
  } = process.env;

  const url =
    `https://graph.facebook.com/${META_GRAPH_VERSION}/oauth/access_token`;

  try {
    console.log(
      "\n================================================="
    );

    console.log(
      "INSTAGRAM TOKEN EXCHANGE START"
    );

    console.log(
      "================================================="
    );

    console.log(
      "INSTAGRAM_APP_ID:",
      INSTAGRAM_APP_ID
    );

    console.log(
      "INSTAGRAM_APP_ID LENGTH:",
      INSTAGRAM_APP_ID?.length
    );

    console.log(
      "INSTAGRAM_APP_SECRET EXISTS:",
      !!INSTAGRAM_APP_SECRET
    );

    console.log(
      "INSTAGRAM_APP_SECRET LENGTH:",
      INSTAGRAM_APP_SECRET?.length
    );

    console.log(
      "INSTAGRAM_APP_SECRET FIRST 8:",
      INSTAGRAM_APP_SECRET?.slice(0, 8)
    );

    console.log(
      "INSTAGRAM_REDIRECT_URI:",
      INSTAGRAM_REDIRECT_URI
    );

    console.log(
      "META_GRAPH_VERSION:",
      META_GRAPH_VERSION
    );

    console.log(
      "TOKEN URL:",
      url
    );

    console.log(
      "CODE LENGTH:",
      code?.length
    );

    console.log(
      "CODE PREVIEW:",
      code?.substring(0, 80)
    );

    console.log(
      "\nREQUEST PARAMS:"
    );

    console.dir(
      {
        client_id:
          INSTAGRAM_APP_ID,

        redirect_uri:
          INSTAGRAM_REDIRECT_URI,

        graph_version:
          META_GRAPH_VERSION,

        code_preview:
          code?.substring(0, 30) + "...",
      },
      {
        depth: null,
      }
    );

    console.log(
      "\nFULL REQUEST URL:"
    );

    console.log(
      `${url}?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(
        INSTAGRAM_REDIRECT_URI
      )}&code=${code?.substring(0, 30)}...`
    );

    console.log(
      "\nSENDING REQUEST TO META..."
    );

    const response =
      await axios.get(
        url,
        {
          params: {
            client_id:
              INSTAGRAM_APP_ID,

            client_secret:
              INSTAGRAM_APP_SECRET,

            redirect_uri:
              INSTAGRAM_REDIRECT_URI,

            code,
          },

          timeout: 30000,
        }
      );

    console.log(
      "\n================================================="
    );

    console.log(
      "TOKEN EXCHANGE SUCCESS"
    );

    console.log(
      "================================================="
    );

    console.log(
      "STATUS:",
      response.status
    );

    console.log(
      "\nHEADERS:"
    );

    console.dir(
      response.headers,
      {
        depth: null,
      }
    );

    console.log(
      "\nDATA:"
    );

    console.dir(
      response.data,
      {
        depth: null,
      }
    );

    console.log(
      "\n=================================================\n"
    );

    return response.data;

  } catch (error) {

    console.log(
      "\n================================================="
    );

    console.log(
      "TOKEN EXCHANGE FAILED"
    );

    console.log(
      "================================================="
    );

    console.log(
      "\nERROR NAME:"
    );

    console.log(
      error.name
    );

    console.log(
      "\nERROR MESSAGE:"
    );

    console.log(
      error.message
    );

    console.log(
      "\nERROR CODE:"
    );

    console.log(
      error.code
    );

    console.log(
      "\nIS AXIOS ERROR:"
    );

    console.log(
      error.isAxiosError
    );

    console.log(
      "\nHAS REQUEST:"
    );

    console.log(
      !!error.request
    );

    console.log(
      "\nHAS RESPONSE:"
    );

    console.log(
      !!error.response
    );

    console.log(
      "\nINSTAGRAM CONFIG:"
    );

    console.dir(
      {
        INSTAGRAM_APP_ID,

        INSTAGRAM_APP_SECRET_LENGTH:
          INSTAGRAM_APP_SECRET?.length,

        INSTAGRAM_REDIRECT_URI,

        META_GRAPH_VERSION,
      },
      {
        depth: null,
      }
    );

    console.log(
      "\nAXIOS CONFIG URL:"
    );

    console.log(
      error.config?.url
    );

    console.log(
      "\nAXIOS CONFIG PARAMS:"
    );

    console.dir(
      error.config?.params,
      {
        depth: null,
      }
    );

    if (
      error.response
    ) {

      console.log(
        "\nRESPONSE STATUS:"
      );

      console.log(
        error.response.status
      );

      console.log(
        "\nRESPONSE STATUS TEXT:"
      );

      console.log(
        error.response.statusText
      );

      console.log(
        "\nRESPONSE HEADERS:"
      );

      console.dir(
        error.response.headers,
        {
          depth: null,
        }
      );

      console.log(
        "\nRESPONSE DATA:"
      );

      console.dir(
        error.response.data,
        {
          depth: null,
        }
      );
    }

    if (
      error.request
    ) {

      console.log(
        "\nREQUEST PATH:"
      );

      console.log(
        error.request.path
      );

      console.log(
        "\nREQUEST METHOD:"
      );

      console.log(
        error.request.method
      );
    }

    console.log(
      "\nFULL ERROR STACK:"
    );

    console.log(
      error.stack
    );

    console.log(
      "\n=================================================\n"
    );

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
      const {
        data: pagesData,
      } = await axios.get(
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
        pageId: page.id,

        instagramUserId:
          profileData.id,

        username:
          profileData.username,

        followers:
          profileData.followers_count ||
          0,

        mediaCount:
          profileData.media_count || 0,

        profileImage:
          profileData.profile_picture_url ||
          "",
      };
    } catch (error) {
      console.error(
        "\nINSTAGRAM PROFILE FETCH ERROR"
      );

      console.error(
        "MESSAGE:",
        error.message
      );

      console.error(
        "STATUS:",
        error.response?.status
      );

      console.error("DATA:");

      console.dir(
        error.response?.data,
        {
          depth: null,
        }
      );

      throw new AppError(
        "Failed to fetch Instagram account information",
        500
      );
    }
  };