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
 * Production-grade signup page.
 *
 * Handles:
 * - form state
 * - register lifecycle
 * - loading states
 * - error rendering
 * - redirect flow
 */
const Signup = () => {
  const navigate =
    useNavigate();

  /**
   * Auth lifecycle.
   */
  const {
    register,

    loading:
      authLoading,
  } = useAuth();

  /**
   * Signup form state.
   */
  const [formData, setFormData] =
    useState({
      name: "",

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
   * Stable form updates.
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
   * Stable signup lifecycle.
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
          await register({
            name:
              formData.name.trim(),

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
            "[SIGNUP ERROR]",
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
        navigate,
        register,
      ]
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Start using your AI
            analytics workspace.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Signup Form */}
        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4"
        >
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>

            <input
              type="text"
              name="name"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
              placeholder="Enter your name"
              autoComplete="name"
              disabled={
                isDisabled
              }
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none transition focus:border-green-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
            />
          </div>

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
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none transition focus:border-green-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
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
              placeholder="Create your password"
              autoComplete="new-password"
              disabled={
                isDisabled
              }
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none transition focus:border-green-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              isDisabled
            }
            className="w-full rounded-xl bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading
              ? "Creating account..."
              : "Sign Up"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-5 text-sm text-gray-600">
          Already have an
          account?{" "}
          <Link
            to="/"
            className="font-medium text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;