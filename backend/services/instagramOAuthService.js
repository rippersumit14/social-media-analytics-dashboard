import axios from "axios";
import jwt from "jsonwebtoken";

/**
 * These are the permissions our app asks Meta for.
 *
 * Why:
 * Instagram professional accounts are connected through Meta Pages,
 * so we need both Instagram and Page permissions.
 */
const INSTAGRAM_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_manage_insights",
];

/**
 * Creates a clear config error when required Instagram env variables are missing.
 *
 * Why:
 * Missing OAuth config should return a clean API response,
 * not crash the backend with a confusing error.
 */
const createConfigError = (key) => {
  const error = new Error(`${key} is required for Instagram OAuth`);
  error.code = "INSTAGRAM_CONFIG_MISSING";
  error.missingKey = key;
  return error;
};
const PLACEHOLDER_VALUES = [
  "your_meta_app_id_here",
  "your_meta_app_secret_here",
];

const getRequiredEnv = (key) => {
  const value = process.env[key];

  /**
   * Why:
   * Empty env values and placeholder values should both be treated as missing.
   * This prevents fake OAuth URLs from being generated during local setup.
   */
  if (!value || PLACEHOLDER_VALUES.includes(value)) {
    throw createConfigError(key);
  }

  return value;
};
/**
 * Pins Meta Graph API version for predictable behavior.
 */
const getGraphVersion = () => process.env.META_GRAPH_VERSION || "v23.0";

/**
 * Central Graph API base URL.
 */
const getGraphBaseUrl = () => {
  return `https://graph.facebook.com/${getGraphVersion()}`;
};

/**
 * Creates a signed OAuth state token.
 *
 * Why:
 * The callback route is public because Meta redirects to it.
 * State proves the callback belongs to the user who started OAuth.
 */
const createOAuthState = ({ userId }) => {
  return jwt.sign(
    {
      userId: String(userId),
      provider: "instagram",
      purpose: "oauth",
    },
    getRequiredEnv("JWT_SECRET"),
    {
      expiresIn: "10m",
    }
  );
};

/**
 * Builds the Meta OAuth URL that frontend will open.
 */
export const createInstagramOAuthUrl = ({ userId }) => {
  const state = createOAuthState({ userId });

  const params = new URLSearchParams({
    client_id: getRequiredEnv("META_APP_ID"),
    redirect_uri: getRequiredEnv("INSTAGRAM_REDIRECT_URI"),
    response_type: "code",
    scope: INSTAGRAM_SCOPES.join(","),
    state,
  });

  return `https://www.facebook.com/${getGraphVersion()}/dialog/oauth?${params.toString()}`;
};

/**
 * Verifies OAuth state returned by Meta.
 */
export const verifyInstagramOAuthState = (state) => {
  const decoded = jwt.verify(state, getRequiredEnv("JWT_SECRET"));

  if (decoded.provider !== "instagram" || decoded.purpose !== "oauth") {
    const error = new Error("Invalid Instagram OAuth state");
    error.code = "INVALID_OAUTH_STATE";
    throw error;
  }

  return decoded;
};

/**
 * Exchanges OAuth code for a short-lived user token.
 */
export const exchangeCodeForUserToken = async (code) => {
  const { data } = await axios.get(`${getGraphBaseUrl()}/oauth/access_token`, {
    params: {
      client_id: getRequiredEnv("META_APP_ID"),
      client_secret: getRequiredEnv("META_APP_SECRET"),
      redirect_uri: getRequiredEnv("INSTAGRAM_REDIRECT_URI"),
      code,
    },
    timeout: 10000,
  });

  return data;
};

/**
 * Converts short-lived token into long-lived token.
 *
 * Why:
 * Long-lived tokens give better production stability for analytics sync.
 */
export const exchangeForLongLivedToken = async (shortLivedToken) => {
  const { data } = await axios.get(`${getGraphBaseUrl()}/oauth/access_token`, {
    params: {
      grant_type: "fb_exchange_token",
      client_id: getRequiredEnv("META_APP_ID"),
      client_secret: getRequiredEnv("META_APP_SECRET"),
      fb_exchange_token: shortLivedToken,
    },
    timeout: 10000,
  });

  return data;
};

/**
 * Finds Instagram professional accounts connected to user's Meta Pages.
 */
export const fetchInstagramProfessionalAccounts = async (userAccessToken) => {
  const { data: pagesResponse } = await axios.get(`${getGraphBaseUrl()}/me/accounts`, {
    params: {
      fields: "id,name,access_token",
      access_token: userAccessToken,
    },
    timeout: 10000,
  });

  const pages = pagesResponse.data || [];
  const accounts = [];

  for (const page of pages) {
    const pageToken = page.access_token || userAccessToken;

    const { data: pageDetails } = await axios.get(`${getGraphBaseUrl()}/${page.id}`, {
      params: {
        fields:
          "instagram_business_account{id,username,name,profile_picture_url,followers_count,media_count}",
        access_token: pageToken,
      },
      timeout: 10000,
    });

    if (pageDetails.instagram_business_account) {
      accounts.push({
        pageId: page.id,
        pageName: page.name,
        pageAccessToken: pageToken,
        instagram: pageDetails.instagram_business_account,
      });
    }
  }

  return accounts;
};