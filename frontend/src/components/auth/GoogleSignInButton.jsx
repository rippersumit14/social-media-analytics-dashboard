import { useEffect, useRef, useState } from "react";

import { env } from "../../config/env";

let googleScriptPromise;

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');

    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

export function GoogleSignInButton({ onCredential, disabled = false }) {
  const buttonRef = useRef(null);
  const [scriptError, setScriptError] = useState("");

  useEffect(() => {
    if (!env.googleClientId || disabled) {
      return undefined;
    }

    let isMounted = true;

    loadGoogleIdentityScript()
      .then(() => {
        if (!isMounted || !buttonRef.current) {
          return;
        }

        buttonRef.current.innerHTML = "";

        window.google.accounts.id.initialize({
          client_id: env.googleClientId,
          callback: (response) => {
            if (response?.credential) {
              onCredential(response.credential);
            }
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "rectangular",
          text: "continue_with",
          logo_alignment: "left",
          width: Math.min(buttonRef.current.offsetWidth || 360, 400),
        });
      })
      .catch(() => {
        if (isMounted) {
          setScriptError("Google sign-in could not load. Refresh and try again.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [disabled, onCredential]);

  if (!env.googleClientId) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">
        Google sign-in is not configured yet.
      </div>
    );
  }

  if (scriptError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
        {scriptError}
      </div>
    );
  }

  return (
    <div
      className={disabled ? "pointer-events-none opacity-60" : ""}
      ref={buttonRef}
      role="group"
      aria-label="Continue with Google"
    />
  );
}
