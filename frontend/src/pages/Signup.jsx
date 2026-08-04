import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import { GoogleSignInButton } from "../components/auth/GoogleSignInButton";
import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/TextField";
import { useAuth } from "../hooks/useAuth";
import { routePaths } from "../routes/routePaths";
import { getApiErrorDetails } from "../utils/apiError";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function validateRegister(values) {
  const errors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export default function Signup() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateRegister(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const email = form.email.trim().toLowerCase();

      const response = await register({
        name: form.name.trim(),
        email,
        password: form.password,
      });

      const message = response.data?.message || response.message || "Account created. You can log in now.";

      toast.success(message);
      navigate(routePaths.login, { replace: true });
    } catch (error) {
      const details = getApiErrorDetails(error, "Unable to create account.");
      const message =
        details.status === 400
          ? "Please check the highlighted fields."
          : details.status === 409
            ? "An account already exists with this email. Log in or verify the pending account."
            : details.status === 429
              ? details.message
              : details.status === 503
              ? "We could not create your account right now. Please try again in a few minutes."
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
      toast.success("Workspace created with Google.");
      navigate(routePaths.dashboard, { replace: true });
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
      <p className="mb-2 text-sm font-semibold uppercase text-brand-700">Authentication</p>
      <h1 className="text-2xl font-semibold text-ink-950">Create your account</h1>
      <p className="mt-2 text-sm leading-6 text-ink-500">
        Continue with Google for a verified workspace, or use email/password as a fallback.
      </p>

      <div className="mt-6">
        <GoogleSignInButton onCredential={handleGoogleCredential} disabled={isSubmitting} />
      </div>

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
          id="name"
          name="name"
          label="Name"
          value={form.name}
          onChange={updateField}
          error={errors.name}
          autoComplete="name"
          placeholder="Your name"
        />
        <TextField
          id="register-email"
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
          id="register-password"
          name="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={updateField}
          error={errors.password}
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
        <TextField
          id="confirm-password"
          name="confirmPassword"
          label="Confirm password"
          type="password"
          value={form.confirmPassword}
          onChange={updateField}
          error={errors.confirmPassword}
          autoComplete="new-password"
          placeholder="Repeat your password"
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link to={routePaths.login} className="font-semibold text-brand-700">
          Log in
        </Link>
      </p>
    </form>
  );
}
