import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import { GoogleSignInButton } from "../components/auth/GoogleSignInButton";
import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/TextField";
import { useAuth } from "../hooks/useAuth";
import { routePaths } from "../routes/routePaths";
import { getApiErrorDetails } from "../utils/apiError";

const initialForm = {
  email: "",
  password: "",
};

function validateLogin(values) {
  const errors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectTo = location.state?.from?.pathname || routePaths.dashboard;

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateLogin(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      toast.success("Welcome back.");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const details = getApiErrorDetails(error, "Unable to log in.");
      const message =
        details.status === 429
            ? details.message
            : details.message;
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleCredential(credential) {
    setIsSubmitting(true);
    setFormError("");

    try {
      await loginWithGoogle(credential);
      toast.success("Welcome to CreatorIQ.");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const details = getApiErrorDetails(error, "Google sign-in failed.");
      setFormError(details.message);
      toast.error(details.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-6 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--app-primary)] text-white">
            <LockKeyhole aria-hidden="true" size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase text-brand-700">Secure workspace</p>
            <h1 className="text-2xl font-semibold text-ink-950">Log in to CreatorIQ</h1>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-ink-500">
          Access your protected creator analytics workspace with account-aware AI, scoring, notes, and Instagram workflows.
        </p>
      </div>

      <GoogleSignInButton onCredential={handleGoogleCredential} disabled={isSubmitting} />

      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase text-[var(--app-muted)]">
        <span className="h-px flex-1 bg-[var(--app-border)]" />
        Email fallback
        <span className="h-px flex-1 bg-[var(--app-border)]" />
      </div>

      {formError ? (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {formError}
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        <TextField
          id="email"
          name="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={updateField}
          error={errors.email}
          autoComplete="email"
          placeholder="creator@example.com"
        />
        <TextField
          id="password"
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={updateField}
          error={errors.password}
          autoComplete="current-password"
          placeholder="Enter your password"
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="grid h-8 w-8 place-items-center rounded-lg text-[var(--app-muted)] transition hover:bg-[var(--app-bg)] hover:text-[var(--app-text)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff aria-hidden="true" size={17} /> : <Eye aria-hidden="true" size={17} />}
            </button>
          }
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>
      </div>

      <div className="mt-5 grid gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-3 text-xs text-[var(--app-muted)]">
        {[
          ["Google verified sign-in", ShieldCheck],
          ["JWT protected routes", Sparkles],
        ].map(([label, Icon]) => (
          <span key={label} className="inline-flex items-center gap-2">
            <Icon aria-hidden="true" size={14} className="text-[var(--app-primary)]" />
            {label}
          </span>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-ink-500">
        New to CreatorIQ?{" "}
        <Link to={routePaths.register} className="font-semibold text-brand-700">
          Create an account
        </Link>
      </p>
    </form>
  );
}
