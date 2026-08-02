export const instagramErrorCategories = {
  NETWORK_ERROR: "NETWORK_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  CONNECTION_NOT_FOUND: "CONNECTION_NOT_FOUND",
  INVALID_OAUTH_STATE: "INVALID_OAUTH_STATE",
  OAUTH_STATE_EXPIRED: "OAUTH_STATE_EXPIRED",
  AUTHORIZATION_CANCELLED: "AUTHORIZATION_CANCELLED",
  MISSING_PERMISSION: "MISSING_PERMISSION",
  UNSUPPORTED_ACCOUNT: "UNSUPPORTED_ACCOUNT",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  RATE_LIMITED: "RATE_LIMITED",
  SYNC_FAILED: "SYNC_FAILED",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

const friendlyMessages = {
  [instagramErrorCategories.NETWORK_ERROR]: "We could not reach the backend. Check that the server is running and try again.",
  [instagramErrorCategories.UNAUTHORIZED]: "Please log in again before managing your Instagram connection.",
  [instagramErrorCategories.CONNECTION_NOT_FOUND]: "No Instagram account is connected yet.",
  [instagramErrorCategories.INVALID_OAUTH_STATE]: "This Instagram connection request is no longer valid. Start the connection again.",
  [instagramErrorCategories.OAUTH_STATE_EXPIRED]: "The Instagram connection request expired. Start the connection again.",
  [instagramErrorCategories.AUTHORIZATION_CANCELLED]: "Instagram authorization was cancelled. No account was connected.",
  [instagramErrorCategories.MISSING_PERMISSION]: "The required Instagram permissions were not granted. Review the authorization screen and try again.",
  [instagramErrorCategories.UNSUPPORTED_ACCOUNT]: "CreatorIQ currently requires a supported Instagram professional account.",
  [instagramErrorCategories.TOKEN_EXPIRED]: "Your Instagram authorization may have expired. Reconnect the account to continue syncing.",
  [instagramErrorCategories.RATE_LIMITED]: "Instagram or the backend is receiving too many requests right now. Please wait a moment and try again.",
  [instagramErrorCategories.SYNC_FAILED]: "Instagram synchronization could not be completed. Please try again.",
  [instagramErrorCategories.SERVER_ERROR]: "The backend could not complete the Instagram request. Please try again in a moment.",
  [instagramErrorCategories.UNKNOWN_ERROR]: "Instagram connection could not be completed. Please try again.",
};

const redirectCodeCategories = {
  oauth_cancelled: instagramErrorCategories.AUTHORIZATION_CANCELLED,
  missing_callback_params: instagramErrorCategories.INVALID_OAUTH_STATE,
  invalid_state: instagramErrorCategories.INVALID_OAUTH_STATE,
  token_exchange_failed: instagramErrorCategories.TOKEN_EXPIRED,
  account_fetch_failed: instagramErrorCategories.SYNC_FAILED,
  account_already_connected: instagramErrorCategories.UNKNOWN_ERROR,
  oauth_failed: instagramErrorCategories.UNKNOWN_ERROR,
};

function normalizeMessage(message = "") {
  return message.toLowerCase();
}

export function normalizeInstagramError(error) {
  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message || error?.message || "";
  const message = normalizeMessage(backendMessage);

  let category = instagramErrorCategories.UNKNOWN_ERROR;

  if (!error?.response && error?.request) {
    category = instagramErrorCategories.NETWORK_ERROR;
  } else if (status === 401) {
    category = instagramErrorCategories.UNAUTHORIZED;
  } else if (status === 404 || message.includes("not found") || message.includes("no connected instagram account")) {
    category = instagramErrorCategories.CONNECTION_NOT_FOUND;
  } else if (status === 429) {
    category = instagramErrorCategories.RATE_LIMITED;
  } else if (message.includes("missing oauth callback parameters") || message.includes("invalid state")) {
    category = instagramErrorCategories.INVALID_OAUTH_STATE;
  } else if (message.includes("expired")) {
    category = instagramErrorCategories.OAUTH_STATE_EXPIRED;
  } else if (message.includes("cancel") || message.includes("denied")) {
    category = instagramErrorCategories.AUTHORIZATION_CANCELLED;
  } else if (message.includes("permission") || message.includes("scope")) {
    category = instagramErrorCategories.MISSING_PERMISSION;
  } else if (message.includes("professional") || message.includes("unsupported")) {
    category = instagramErrorCategories.UNSUPPORTED_ACCOUNT;
  } else if (message.includes("token")) {
    category = instagramErrorCategories.TOKEN_EXPIRED;
  } else if (message.includes("sync")) {
    category = instagramErrorCategories.SYNC_FAILED;
  } else if (status >= 500) {
    category = instagramErrorCategories.SERVER_ERROR;
  }

  return {
    category,
    message: friendlyMessages[category],
    backendMessage,
    status,
  };
}

export function normalizeInstagramRedirectResult(code) {
  if (!code) {
    return {
      category: instagramErrorCategories.UNKNOWN_ERROR,
      message: friendlyMessages[instagramErrorCategories.UNKNOWN_ERROR],
    };
  }

  if (code === "success" || code === "connected" || code === "true") {
    return {
      category: "SUCCESS",
      message: "Instagram account connected successfully. You can now sync available creator data.",
    };
  }

  const category = redirectCodeCategories[code] || instagramErrorCategories.UNKNOWN_ERROR;

  if (code === "account_already_connected") {
    return {
      category,
      message: "This Instagram account is already connected to a CreatorIQ workspace.",
    };
  }

  return {
    category,
    message: friendlyMessages[category],
  };
}
