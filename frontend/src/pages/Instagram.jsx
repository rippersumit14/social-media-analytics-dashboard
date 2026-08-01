import { useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import toast from "react-hot-toast";
import { Camera, RefreshCw, ShieldAlert } from "lucide-react";
import { useLocation } from "react-router-dom";

import { InstagramAccountCard } from "../components/instagram/InstagramAccountCard";
import { InstagramAccountSkeleton } from "../components/instagram/InstagramAccountSkeleton";
import { InstagramBenefitsGrid } from "../components/instagram/InstagramBenefitsGrid";
import { InstagramConnectEmptyState } from "../components/instagram/InstagramConnectEmptyState";
import { InstagramDisconnectDialog } from "../components/instagram/InstagramDisconnectDialog";
import { InstagramSetupGuide } from "../components/instagram/InstagramSetupGuide";
import { InstagramStatusBanner } from "../components/instagram/InstagramStatusBanner";
import { InstagramSyncPanel } from "../components/instagram/InstagramSyncPanel";
import { PageHeader } from "../components/common/PageHeader";
import { useInstagramAccount } from "../hooks/useInstagramAccount";
import { normalizeInstagramRedirectResult } from "../utils/normalizeInstagramError";

function getCallbackNotice(searchParams) {
  const status = searchParams.get("status") || searchParams.get("success") || searchParams.get("connected");
  const error = searchParams.get("error") || searchParams.get("reason") || searchParams.get("cancelled");

  if (status === "true" || status === "success" || status === "connected") {
    const normalized = normalizeInstagramRedirectResult("success");

    return {
      type: "success",
      message: normalized.message,
    };
  }

  if (error === "cancelled" || error === "true") {
    const normalized = normalizeInstagramRedirectResult("oauth_cancelled");

    return {
      type: "warning",
      message: normalized.message,
    };
  }

  if (error) {
    const normalized = normalizeInstagramRedirectResult(error);

    return {
      type: "error",
      message: normalized.message,
    };
  }

  return null;
}

function showNoticeToast(notice) {
  if (notice.type === "success") {
    toast.success(notice.message);
  } else if (notice.type === "error") {
    toast.error(notice.message);
  } else {
    toast(notice.message);
  }
}

export default function Instagram() {
  const location = useLocation();
  const guideRef = useRef(null);
  const hasProcessedCallbackNotice = useRef(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const {
    account,
    connectionState,
    error,
    isLoading,
    isRefreshing,
    isConnecting,
    isSyncing,
    lastSyncResult,
    refreshAccount,
    startConnection,
    syncCreatorData,
  } = useInstagramAccount();

  useEffect(() => {
    if (hasProcessedCallbackNotice.current) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const notice = getCallbackNotice(params);

    if (notice) {
      hasProcessedCallbackNotice.current = true;
      showNoticeToast(notice);
      refreshAccount();
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (location.state?.refreshInstagram) {
      hasProcessedCallbackNotice.current = true;
      refreshAccount();
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [location.state, refreshAccount]);

  async function handleConnect() {
    try {
      toast.loading("Redirecting you to Instagram authorization...", { id: "instagram-connect" });
      await startConnection();
    } catch {
      toast.error("We could not start the Instagram connection process. Please try again in a moment.", { id: "instagram-connect" });
    }
  }

  async function handleSync() {
    try {
      toast.loading("Synchronizing Instagram creator data...", { id: "instagram-sync" });
      await syncCreatorData();
      toast.success("Your available Instagram creator data has been synchronized successfully.", { id: "instagram-sync" });
    } catch {
      toast.error("Instagram synchronization could not be completed. Please try again.", { id: "instagram-sync" });
    }
  }

  function scrollToGuide() {
    guideRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleConnectFirst() {
    if (account) {
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    toast("Connect Instagram first to unlock this workspace.");
  }

  return (
    <section className="space-y-6 text-[var(--app-text)]">
      <PageHeader
        eyebrow="Instagram"
        title="Instagram Connection"
        description="Connect and synchronize a supported Instagram professional account to unlock analytics, Creator Score, AI insights, and personalized recommendations."
        actions={
          <>
            <Button variant="outlined" onClick={() => refreshAccount()} disabled={isRefreshing || isLoading} startIcon={<RefreshCw size={17} />}>
              {isRefreshing ? "Refreshing..." : "Refresh status"}
            </Button>
            {account ? (
              <>
                <Button variant="contained" onClick={handleSync} disabled={isSyncing} startIcon={<RefreshCw size={17} />}>
                  {isSyncing ? "Synchronizing..." : "Sync now"}
                </Button>
                <Button variant="outlined" color="warning" onClick={handleConnect} disabled={isConnecting} startIcon={<Camera size={17} />}>
                  Reconnect
                </Button>
              </>
            ) : (
              <Button variant="contained" onClick={handleConnect} disabled={isConnecting} startIcon={<Camera size={17} />}>
                {isConnecting ? "Redirecting..." : "Connect Instagram"}
              </Button>
            )}
          </>
        }
      />

      <InstagramStatusBanner
        state={connectionState}
        error={error}
        hasAccount={Boolean(account)}
        onConnect={handleConnect}
        onSync={handleSync}
        isConnecting={isConnecting}
        isSyncing={isSyncing}
      />

      {isLoading ? <InstagramAccountSkeleton /> : null}

      {!isLoading && !account ? <InstagramConnectEmptyState onConnect={handleConnect} onLearn={scrollToGuide} isConnecting={isConnecting} /> : null}

      {!isLoading && account ? (
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.85fr]">
          <InstagramAccountCard account={account} onSync={handleSync} isSyncing={isSyncing} />
          <InstagramSyncPanel account={account} onSync={handleSync} isSyncing={isSyncing} lastSyncResult={lastSyncResult} />
        </div>
      ) : null}

      <InstagramBenefitsGrid isConnected={Boolean(account)} onConnectFirst={handleConnectFirst} />

      <InstagramSetupGuide guideRef={guideRef} />

      <section className="rounded-xl border border-[var(--app-border)] bg-[var(--app-paper)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <ShieldAlert aria-hidden="true" className="mt-0.5 shrink-0 text-amber-500" size={20} />
            <div>
              <h2 className="text-lg font-semibold text-[var(--app-text)]">Connection management</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
                Reconnection is supported through the same backend authorization URL flow. Backend disconnect support is not currently exposed.
              </p>
            </div>
          </div>
          <Button variant="outlined" color="error" onClick={() => setDisconnectOpen(true)}>
            Disconnect information
          </Button>
        </div>
      </section>

      <InstagramDisconnectDialog open={disconnectOpen} onClose={() => setDisconnectOpen(false)} />
    </section>
  );
}
