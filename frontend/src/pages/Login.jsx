import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

/**
 * Production-grade login page.
 *
 * Handles:
 * - form state
 * - auth lifecycle
 * - loading state
 * - error rendering
 * - redirect flow
 */
const Login = () => {
  const navigate =
    useNavigate();

  /**
   * Auth lifecycle.
   */
  const {
    login,

    loading:
      authLoading,
  } = useAuth();

  /**
   * Login form state.
   */
  const [formData, setFormData] =
    useState({
      email: "",

      password: "",
    });

  /**
   * UI state.
   */
  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /**
   * Stable disabled state.
   */
  const isDisabled =
    useMemo(() => {
      return (
        loading ||
        authLoading
      );
    }, [
      loading,
      authLoading,
    ]);

  /**
   * Stable input updates.
   */
  const handleChange =
    useCallback((event) => {
      const {
        name,
        value,
      } = event.target;

      setFormData((prev) => ({
        ...prev,

        [name]: value,
      }));
    }, []);

  /**
   * Stable login lifecycle.
   */
  const handleSubmit =
    useCallback(
      async (event) => {
        event.preventDefault();

        /**
         * Prevent duplicate submits.
         */
        if (isDisabled) {
          return;
        }

        setError("");

        setLoading(true);

        try {
          /**
           * Stable auth payload.
           */
          await login({
            email:
              formData.email.trim(),

            password:
              formData.password,
          });

          /**
           * Redirect after success.
           */
          navigate(
            "/dashboard"
          );
        } catch (error) {
          console.error(
            "[LOGIN ERROR]",
            error
          );

          /**
           * Interceptor-normalized errors.
           */
          setError(
            error.message
          );
        } finally {
          setLoading(false);
        }
      },
      [
        formData,
        isDisabled,
        login,
        navigate,
      ]
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Login
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Continue to your AI
            analytics workspace.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4"
        >
          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={
                formData.email
              }
              onChange={
                handleChange
              }
              placeholder="Enter your email"
              autoComplete="email"
              disabled={
                isDisabled
              }
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={
                formData.password
              }
              onChange={
                handleChange
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={
                isDisabled
              }
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              isDisabled
            }
            className="w-full rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-5 text-sm text-gray-600">
          Do not have an
          account?{" "}
          <Link
            to="/signup"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;