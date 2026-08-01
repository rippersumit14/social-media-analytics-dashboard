import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Camera, CheckCircle2, Mail, RefreshCw, ShieldCheck, UserCircle } from "lucide-react";

import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/ui/Button";
import { LoadingCard } from "../components/ui/LoadingCard";
import { SectionCard } from "../components/ui/SectionCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import { useInstagramAccount } from "../hooks/useInstagramAccount";
import { routePaths } from "../routes/routePaths";
import { formatDateTime } from "../utils/formatters";

function FieldRow({ label, value }) {
  return (
    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
      <p className="text-xs font-semibold uppercase text-[var(--app-muted)]">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-[var(--app-text)]">{value || "Unavailable"}</p>
    </div>
  );
}

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { account, isLoading: isAccountLoading, refreshAccount } = useInstagramAccount();
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);

    try {
      await Promise.all([refreshUser(), refreshAccount()]);
      toast.success("Profile data refreshed.");
    } catch {
      toast.error("Unable to refresh profile data.");
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <section className="space-y-6 text-[var(--app-text)]">
      <PageHeader
        eyebrow="Profile"
        title="Creator profile"
        description="Review the account identity and connected creator context currently returned by the backend."
        actions={
          <>
            <Button as={Link} to={routePaths.settings} variant="secondary">
              <ShieldCheck aria-hidden="true" size={18} />
              Settings
            </Button>
            <Button type="button" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw aria-hidden="true" size={18} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard title="Account identity" description="Profile editing is not exposed by the current backend contract.">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-muted)]">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-20 w-20 rounded-lg object-cover" />
              ) : (
                <UserCircle aria-hidden="true" size={34} />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="break-words text-xl font-semibold text-[var(--app-text)]">{user?.name || "Creator"}</h2>
              <p className="mt-1 flex items-center gap-2 break-all text-sm text-[var(--app-muted)]">
                <Mail aria-hidden="true" size={16} />
                {user?.email || "Email unavailable"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge variant={user?.isEmailVerified ? "success" : "warning"}>
                  {user?.isEmailVerified ? "Email verified" : "Email not verified"}
                </StatusBadge>
                <StatusBadge>{user?.plan || "Plan unavailable"}</StatusBadge>
                <StatusBadge variant={user?.isActive === false ? "danger" : "success"}>
                  {user?.isActive === false ? "Inactive" : "Active"}
                </StatusBadge>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Backend user fields" description="Only persisted user fields are shown here.">
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldRow label="Name" value={user?.name} />
            <FieldRow label="Email" value={user?.email} />
            <FieldRow label="Joined" value={formatDateTime(user?.createdAt)} />
            <FieldRow label="Last login" value={formatDateTime(user?.lastLoginAt)} />
            <FieldRow label="Email verified at" value={formatDateTime(user?.emailVerifiedAt)} />
            <FieldRow label="User id" value={user?._id || user?.id} />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Instagram connection"
          description="Connected account status comes from the dashboard overview contract."
          action={<StatusBadge variant={account ? "success" : "warning"}>{account ? "Connected" : "Not connected"}</StatusBadge>}
        >
          {isAccountLoading ? (
            <LoadingCard rows={4} />
          ) : account ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--app-bg)] text-[var(--app-primary)]">
                  <Camera aria-hidden="true" size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--app-text)]">{account.displayName || account.username || "Instagram account"}</p>
                  <p className="text-sm text-[var(--app-muted)]">{account.username ? `@${account.username}` : "Username unavailable"}</p>
                </div>
              </div>
              <Button as={Link} to={routePaths.instagram} variant="secondary">
                Manage
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-bg)] p-5">
              <p className="text-sm font-semibold text-[var(--app-text)]">No Instagram account connected</p>
              <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">Connect Instagram to unlock analytics, scoring, AI insights, and recommendations.</p>
              <Button as={Link} to={routePaths.instagram} className="mt-4">
                <Camera aria-hidden="true" size={18} />
                Connect Instagram
              </Button>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Account readiness" description="Current account state for authenticated product workflows.">
          <div className="space-y-3">
            {[
              ["Authenticated session", true],
              ["Verified email", Boolean(user?.isEmailVerified)],
              ["Active account", user?.isActive !== false],
              ["Instagram connected", Boolean(account)],
            ].map(([label, isReady]) => (
              <div key={label} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
                <span className="text-sm font-medium text-[var(--app-text)]">{label}</span>
                <span className={isReady ? "text-teal-600" : "text-amber-600"}>
                  <CheckCircle2 aria-hidden="true" size={18} />
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </section>
  );
}
