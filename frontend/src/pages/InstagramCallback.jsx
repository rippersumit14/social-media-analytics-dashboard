import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { InstagramCallbackStatus } from "../components/instagram/InstagramCallbackStatus";
import { routePaths } from "../routes/routePaths";
import { normalizeInstagramRedirectResult } from "../utils/normalizeInstagramError";

function getProviderResult(searchParams) {
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const success = searchParams.get("connected") || searchParams.get("success");
  const error = searchParams.get("error") || searchParams.get("reason") || searchParams.get("cancelled");

  if (error) {
    const normalized = normalizeInstagramRedirectResult(error === "true" ? "oauth_cancelled" : error);

    return {
      status: normalized.category === "AUTHORIZATION_CANCELLED" ? "cancelled" : "error",
      message: normalized.message,
    };
  }

  if (success === "true" || success === "connected" || success === "success") {
    const normalized = normalizeInstagramRedirectResult("success");

    return {
      status: "success",
      message: normalized.message,
    };
  }

  if (code && state) {
    return {
      status: "error",
      message: "This callback contains raw OAuth parameters. Start the Instagram connection again so the backend can process it safely.",
    };
  }

  return {
    status: "error",
    message: "The Instagram callback is missing required connection details. Start the connection again.",
  };
}

export default function InstagramCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasSubmitted = useRef(false);
  const initialResult = useMemo(() => getProviderResult(searchParams), [searchParams]);
  const [status, setStatus] = useState(initialResult.status);
  const [message, setMessage] = useState(initialResult.message);

  useEffect(() => {
    if (hasSubmitted.current) {
      return undefined;
    }

    hasSubmitted.current = true;
    window.history.replaceState({}, "", routePaths.instagramCallback);
    setStatus(initialResult.status);
    setMessage(initialResult.message);

    if (initialResult.status === "success") {
      toast.success(initialResult.message);

      const timeoutId = window.setTimeout(() => {
        navigate(routePaths.instagram, { replace: true, state: { refreshInstagram: true } });
      }, 1400);

      return () => window.clearTimeout(timeoutId);
    }

    if (initialResult.status === "cancelled") {
      toast(initialResult.message);
    } else {
      toast.error(initialResult.message);
    }

    return undefined;
  }, [initialResult, navigate]);

  function handleRetry() {
    navigate(routePaths.instagram, { replace: true });
  }

  return (
    <section className="grid min-h-[55vh] place-items-center text-[var(--app-text)]">
      <InstagramCallbackStatus status={status} message={message} onRetry={handleRetry} />
    </section>
  );
}
