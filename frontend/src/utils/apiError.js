const statusMessages = {
  400: "Please check the highlighted fields.",
  401: "Please log in again to continue.",
  403: "You do not have access to complete this action.",
  409: "An account already exists with this email.",
  429: "Too many attempts. Please wait before trying again.",
  503: "This service is temporarily unavailable. Please try again in a few minutes.",
};

function readRetryAfter(error) {
  const value = error?.response?.headers?.["retry-after"];
  const seconds = Number(value);

  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

export function getApiErrorDetails(error, fallback = "Something went wrong. Please try again.") {
  const status = error?.response?.status;
  const retryAfter = readRetryAfter(error);
  const serverMessage = error?.response?.data?.message;
  const message = serverMessage || statusMessages[status] || error?.message || fallback;

  return {
    message:
      status === 429 && retryAfter
        ? `${message} Try again in about ${retryAfter} seconds.`
        : message,
    retryAfter,
    serverMessage,
    status,
  };
}

export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  return getApiErrorDetails(error, fallback).message;
}

export function isRateLimitError(error) {
  return error?.response?.status === 429;
}
