import { apiEndpoints } from "../api/endpoints";
import { env } from "../config/env";
import { getStoredToken } from "../utils/authStorage";
import { createSSEParser } from "../utils/sseParser";

function createStreamError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function readErrorResponse(response) {
  try {
    const payload = await response.json();
    return payload?.message || response.statusText;
  } catch {
    return response.statusText;
  }
}

export async function streamChatMessage({
  conversationId,
  message,
  signal,
  onStart,
  onModel,
  onChunk,
  onComplete,
  onError,
}) {
  const token = getStoredToken();
  const streamUrl = `${env.apiBaseUrl}${apiEndpoints.conversations.stream(conversationId)}`;

  const response = await fetch(streamUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message }),
    signal,
  });

  if (!response.ok) {
    const message = await readErrorResponse(response);
    throw createStreamError(message || "Unable to start AI stream.", response.status);
  }

  if (!response.body) {
    throw createStreamError("Streaming is not supported by this browser.", 0);
  }

  const decoder = new TextDecoder();
  const parser = createSSEParser((event) => {
    if (event.type === "start") {
      onStart?.(event.data);
      return;
    }

    if (event.type === "model") {
      onModel?.(event.data);
      return;
    }

    if (event.type === "chunk") {
      onChunk?.(event.data);
      return;
    }

    if (event.type === "complete") {
      onComplete?.();
      return;
    }

    if (event.type === "error") {
      onError?.(event.data);
    }
  });

  const reader = response.body.getReader();

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    parser.push(decoder.decode(value, { stream: true }));
  }

  parser.push(decoder.decode());
  parser.flush();
}
