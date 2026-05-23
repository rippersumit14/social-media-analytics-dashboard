import {
  memo,
  useMemo,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../../context/AuthContext.jsx";

/**
 * Production-grade protected route.
 *
 * Handles:
 * - auth hydration
 * - protected route access
 * - redirect synchronization
 * - stale auth prevention
 */
const ProtectedRoute = ({
  children,
}) => {
  /**
   * Auth lifecycle.
   */
  const {
    isAuthenticated,

    loading,
  } = useAuth();

  /**
   * Current route location.
   */
  const location =
    useLocation();

  /**
   * Stable loading state.
   */
  const isLoading =
    useMemo(() => {
      return Boolean(
        loading
      );
    }, [loading]);

  /**
   * Stable authentication state.
   */
  const canAccessRoute =
    useMemo(() => {
      return Boolean(
        isAuthenticated
      );
    }, [isAuthenticated]);

  /**
   * Block rendering during
   * auth hydration.
   */
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="rounded-2xl bg-white px-6 py-5 shadow-sm">
          <p className="text-sm font-medium text-gray-600">
            Restoring your
            session...
          </p>
        </div>
      </div>
    );
  }

  /**
   * Redirect unauthenticated users.
   */
  if (!canAccessRoute) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  /**
   * Render protected routes safely.
   */
  return children;
};

/**
 * Prevent unnecessary rerenders.
 */
export default memo(
  ProtectedRoute
);