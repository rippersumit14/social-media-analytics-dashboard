import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/TextField";
import { authService } from "../services/authService";
import { routePaths } from "../routes/routePaths";
import { getApiErrorMessage } from "../utils/apiError";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialEmail = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const [form, setForm] = useState({ email: initialEmail, otp: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setFormError("");
  }

  function validate() {
    const nextErrors = {};

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = "Enter the email used during registration.";
    }

    if (!/^\d{6}$/.test(form.otp)) {
      nextErrors.otp = "Enter the 6-digit OTP.";
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      await authService.verifyEmail({
        email: form.email.trim().toLowerCase(),
        otp: form.otp.trim(),
      });

      toast.success("Email verified. You can log in now.");
      navigate(routePaths.login, { replace: true });
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to verify email.");
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setErrors((current) => ({ ...current, email: "Enter an email before resending OTP." }));
      return;
    }

    setIsResending(true);
    setFormError("");

    try {
      await authService.resendOtp({ email: form.email.trim().toLowerCase() });
      toast.success("Verification OTP sent.");
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to resend OTP.");
      setFormError(message);
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="mb-2 text-sm font-semibold uppercase text-brand-700">Email verification</p>
      <h1 className="text-2xl font-semibold text-ink-950">Verify your email</h1>
      <p className="mt-2 text-sm leading-6 text-ink-500">
        Enter the OTP sent by the backend email service before logging in.
      </p>

      {formError ? (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {formError}
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        <TextField
          id="verify-email"
          name="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={updateField}
          error={errors.email}
          autoComplete="email"
        />
        <TextField
          id="otp"
          name="otp"
          label="OTP"
          inputMode="numeric"
          maxLength={6}
          value={form.otp}
          onChange={updateField}
          error={errors.otp}
          placeholder="123456"
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Verify email"}
        </Button>
        <Button type="button" variant="secondary" className="w-full" onClick={handleResend} disabled={isResending}>
          {isResending ? "Sending OTP..." : "Resend OTP"}
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already verified?{" "}
        <Link to={routePaths.login} className="font-semibold text-brand-700">
          Log in
        </Link>
      </p>
    </form>
  );
}
