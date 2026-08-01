import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        details.status === 403 && details.message.toLowerCase().includes("verify")
          ? "Please verify your email before logging in."
          : details.status === 429
            ? details.message
            : details.message;
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="mb-2 text-sm font-semibold uppercase text-brand-700">Authentication</p>
      <h1 className="text-2xl font-semibold text-ink-950">Log in to CreatorIQ</h1>
      <p className="mt-2 text-sm leading-6 text-ink-500">
        Access your protected creator analytics workspace.
      </p>

      {formError ? (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {formError}
          {formError.toLowerCase().includes("verify") ? (
            <Link
              to={`${routePaths.verifyEmail}?email=${encodeURIComponent(form.email.trim().toLowerCase())}`}
              className="ml-1 font-semibold underline"
            >
              Verify email
            </Link>
          ) : null}
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
          type="password"
          value={form.password}
          onChange={updateField}
          error={errors.password}
          autoComplete="current-password"
          placeholder="Enter your password"
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>
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
