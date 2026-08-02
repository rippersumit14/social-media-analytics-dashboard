import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { LockKeyhole, Moon, ShieldCheck, Sun, UserCircle } from "lucide-react";

import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/ui/Button";
import { SectionCard } from "../components/ui/SectionCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { TextField } from "../components/ui/TextField";
import { useAuth } from "../hooks/useAuth";
import { useThemeMode } from "../hooks/useThemeMode";
import { routePaths } from "../routes/routePaths";
import { authService } from "../services/authService";
import { getApiErrorDetails } from "../utils/apiError";
import { formatDateTime, formatNumber } from "../utils/formatters";

const initialPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function validatePasswordForm(values) {
  const errors = {};

  if (!values.currentPassword) {
    errors.currentPassword = "Current password is required.";
  }

  if (values.newPassword.length < 8) {
    errors.newPassword = "New password must be at least 8 characters.";
  }

  if (values.newPassword.length > 128) {
    errors.newPassword = "New password cannot exceed 128 characters.";
  }

  if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

function SettingUnavailable({ title, description }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-bg)] p-4">
      <p className="text-sm font-semibold text-[var(--app-text)]">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">{description}</p>
      <StatusBadge>Unavailable in current backend</StatusBadge>
    </div>
  );
}

function UsageRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
      <span className="text-sm text-[var(--app-muted)]">{label}</span>
      <span className="break-words text-right text-sm font-semibold text-[var(--app-text)]">{value}</span>
    </div>
  );
}

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const { mode, setThemeMode } = useThemeMode();
  const [form, setForm] = useState(initialPasswordForm);
  const [errors, setErrors] = useState({});

  const usage = useMemo(() => {
    const used = Number.isFinite(Number(user?.aiUsageCount)) ? Number(user.aiUsageCount) : null;
    const limit = Number.isFinite(Number(user?.aiUsageLimit)) ? Number(user.aiUsageLimit) : null;

    return {
      used,
      limit,
      remaining: used !== null && limit !== null ? Math.max(limit - used, 0) : null,
    };
  }, [user]);

  const updatePassword = useMutation({
    mutationFn: authService.updatePassword,
    onSuccess: async (response) => {
      toast.success(response.message || "Password updated successfully.");
      setForm(initialPasswordForm);
      setErrors({});
      await refreshUser();
    },
    onError: (error) => {
      const details = getApiErrorDetails(error, "Unable to update password.");
      toast.error(details.status === 429 ? details.message : details.message);
    },
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validatePasswordForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    updatePassword.mutate({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
  }

  return (
    <section className="space-y-6 text-[var(--app-text)]">
      <PageHeader
        eyebrow="Settings"
        title="Account settings"
        description="Manage supported security, appearance, and account-readiness settings from the current backend contract."
        actions={
          <Button as={Link} to={routePaths.profile} variant="secondary">
            <UserCircle aria-hidden="true" size={18} />
            Profile
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Security" description="Change password through the protected backend password endpoint.">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <TextField
              id="current-password"
              name="currentPassword"
              label="Current password"
              type="password"
              value={form.currentPassword}
              error={errors.currentPassword}
              autoComplete="current-password"
              placeholder="Enter current password"
              onChange={handleChange}
            />
            <TextField
              id="new-password"
              name="newPassword"
              label="New password"
              type="password"
              value={form.newPassword}
              error={errors.newPassword}
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              onChange={handleChange}
            />
            <TextField
              id="confirm-new-password"
              name="confirmPassword"
              label="Confirm new password"
              type="password"
              value={form.confirmPassword}
              error={errors.confirmPassword}
              autoComplete="new-password"
              placeholder="Repeat new password"
              onChange={handleChange}
            />
            <Button type="submit" disabled={updatePassword.isPending}>
              <LockKeyhole aria-hidden="true" size={18} />
              {updatePassword.isPending ? "Updating..." : "Update password"}
            </Button>
          </form>
        </SectionCard>

        <SectionCard title="AI usage and plan" description="Only values returned by the current user API are displayed.">
          <div className="space-y-3">
            <UsageRow label="Current plan" value={user?.plan || "Unavailable"} />
            <UsageRow label="AI requests used" value={usage.used === null ? "Unavailable" : formatNumber(usage.used)} />
            <UsageRow label="Usage limit" value={usage.limit === null ? "Not exposed by backend" : formatNumber(usage.limit)} />
            <UsageRow label="Remaining requests" value={usage.remaining === null ? "Unavailable" : formatNumber(usage.remaining)} />
            <UsageRow label="Reset date" value={user?.aiUsageResetDate ? formatDateTime(user.aiUsageResetDate) : "Unavailable"} />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Appearance" description="Theme preference is stored locally in this browser.">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setThemeMode("light")}
              className={[
                "inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition",
                mode === "light" ? "border-[var(--app-primary)] bg-[var(--app-bg)] text-[var(--app-primary)]" : "border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-bg)]",
              ].join(" ")}
              aria-pressed={mode === "light"}
            >
              <Sun aria-hidden="true" size={17} />
              Light
            </button>
            <button
              type="button"
              onClick={() => setThemeMode("dark")}
              className={[
                "inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition",
                mode === "dark" ? "border-[var(--app-primary)] bg-[var(--app-bg)] text-[var(--app-primary)]" : "border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-bg)]",
              ].join(" ")}
              aria-pressed={mode === "dark"}
            >
              <Moon aria-hidden="true" size={17} />
              Dark
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Account and preferences" description="Unsupported settings are shown plainly instead of pretending to save.">
          <div className="space-y-3">
            <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck aria-hidden="true" size={18} className="text-[var(--app-primary)]" />
                <p className="text-sm font-semibold text-[var(--app-text)]">Email verification</p>
              </div>
              <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
                {user?.isEmailVerified ? "Your email is verified." : "Email verification is required before login."}
              </p>
            </div>
            <SettingUnavailable title="Profile editing" description="The backend currently returns user profile data but does not expose a profile update endpoint." />
            <SettingUnavailable title="Notifications" description="Notification preference routes are not mounted in the current backend." />
            <SettingUnavailable title="Subscription management" description="Plan fields exist on the user model, but upgrade, billing, and subscription routes are not available yet." />
          </div>
        </SectionCard>
      </div>
    </section>
  );
}
