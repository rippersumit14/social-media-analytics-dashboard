import SocialAccount from "../models/SocialAccount.js";
import {
  createInstagramOAuthUrl,
  exchangeCodeForUserToken,
  exchangeForLongLivedToken,
  fetchInstagramProfessionalAccounts,
  verifyInstagramOAuthState,
} from "../services/instagramOAuthService.js";

/**
 * Calculates when a Meta token expires.
 *
 * Why:
 * We store token expiry so future sync jobs can detect expired tokens
 * and avoid failing silently during analytics refresh.
 */
const buildTokenExpiryDate = (expiresInSeconds) => {
  if (!expiresInSeconds) return null;

  return new Date(Date.now() + Number(expiresInSeconds) * 1000);
};

/**
 * Returns a safe account response without exposing accessToken.
 *
 * Why:
 * Instagram tokens must never be sent to frontend.
 * The frontend only needs account/profile metadata.
 */
const toSafeInstagramAccount = (account) => ({
  _id: account._id,
  platform: account.platform,
  username: account.username,
  displayName: account.displayName,
  profileId: account.profileId,
  instagramUserId: account.instagramUserId,
  pageId: account.pageId,
  profileImage: account.profileImage,
  accountType: account.accountType,
  isActive: account.isActive,
  lastSyncedAt: account.lastSyncedAt,
  createdAt: account.createdAt,
  updatedAt: account.updatedAt,
});

/**
 * Converts known Instagram OAuth errors into stable API responses.
 *
 * Why:
 * Clean error responses are easier for frontend to handle and safer for production.
 * We avoid leaking provider internals or secrets.
 */
const handleInstagramOAuthError = (res, error) => {
  if (error.code === "INSTAGRAM_CONFIG_MISSING") {
    return res.status(503).json({
      message: "Instagram OAuth is not configured",
      missingKey: error.missingKey,
    });
  }

  if (error.code === "INVALID_OAUTH_STATE" || error.name === "JsonWebTokenError") {
    return res.status(400).json({
      message: "Invalid Instagram OAuth state",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(400).json({
      message: "Instagram OAuth state expired. Please try connecting again.",
    });
  }

  return res.status(500).json({
    message: "Instagram connection failed",
  });
};

/**
 * @desc    Generate Instagram OAuth URL
 * @route   GET /api/instagram/oauth/url
 * @access  Private
 */
export const getInstagramOAuthUrl = async (req, res) => {
  try {
    const authUrl = createInstagramOAuthUrl({
      userId: req.user._id,
    });

    return res.status(200).json({
      authUrl,
    });
  } catch (error) {
    return handleInstagramOAuthError(res, error);
  }
};

/**
 * @desc    Handle Instagram OAuth callback
 * @route   GET /api/instagram/oauth/callback
 * @access  Public callback, protected by signed OAuth state
 */
export const handleInstagramOAuthCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({
        message: "OAuth code and state are required",
      });
    }

    /**
     * The callback itself is public because Meta redirects to it.
     * The signed state tells us which authenticated user started the flow.
     */
    const decodedState = verifyInstagramOAuthState(state);

    const shortToken = await exchangeCodeForUserToken(code);

    const longToken = await exchangeForLongLivedToken(shortToken.access_token);

    const instagramAccounts = await fetchInstagramProfessionalAccounts(
      longToken.access_token
    );

    if (!instagramAccounts.length) {
      return res.status(400).json({
        message: "No Instagram professional account found for this Meta account",
      });
    }

    /**
     * MVP behavior:
     * Connect the first available Instagram professional account.
     *
     * Later, if a user manages multiple accounts, frontend can show
     * an account picker before saving.
     */
    const selectedAccount = instagramAccounts[0];
    const instagram = selectedAccount.instagram;

    const account = await SocialAccount.findOneAndUpdate(
      {
        user: decodedState.userId,
        platform: "instagram",
        instagramUserId: instagram.id,
      },
      {
        $set: {
          user: decodedState.userId,
          platform: "instagram",
          username: instagram.username,
          displayName: instagram.name || instagram.username,
          profileId: instagram.id,
          instagramUserId: instagram.id,
          pageId: selectedAccount.pageId,
          profileImage: instagram.profile_picture_url || "",
          accessToken: selectedAccount.pageAccessToken,
          tokenExpiresAt: buildTokenExpiryDate(longToken.expires_in),
          permissions: [],
          accountType: "business",
          providerMetadata: {
            pageName: selectedAccount.pageName,
            followersCountAtConnect: instagram.followers_count,
            mediaCountAtConnect: instagram.media_count,
          },
          isActive: true,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.redirect(
      buildFrontendRedirectUrl({
        status: "connected",
        accountId: account._id,
      })
    );
  } catch (error) {
    return res.redirect(
      buildFrontendRedirectUrl({
        status: "failed",
        reason: "connection_failed",
      })
    )
  }
};

/**
 * Builds a safe frontend redirect URL after Instagram OAuth finishes.
 *
 * Why:
 * Meta redirects users to the backend callback, but the user experience
 * must end inside the React app, not on a raw backend JSON page.
 */
const buildFrontendRedirectUrl = ({ status, reason, accountId }) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const redirectUrl = new URL("/settings", frontendUrl);

  redirectUrl.searchParams.set("instagram", status);

  if (reason) {
    redirectUrl.searchParams.set("reason", reason);
  }

  if (accountId) {
    redirectUrl.searchParams.set("accountId", String(accountId));
  }

  return redirectUrl.toString();
};