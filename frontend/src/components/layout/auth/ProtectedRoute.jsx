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
 * Responsibilities:
 * - auth hydration synchronization
 * - protected route access
 * - redirect stabilization
 * - stale auth prevention
 * - route flicker prevention
 */
const ProtectedRoute = ({
  children,
}) => {
  /**
   * Auth lifecycle.
   */
  const {
    isAuthenticated,

    hydrationLoading,
  } = useAuth();

  /**
   * Current route location.
   */
  const location =
    useLocation();

  /**
   * Stable hydration state.
   */
  const isHydrating =
    useMemo(() => {
      return Boolean(
        hydrationLoading
      );
    }, [hydrationLoading]);

  /**
   * Stable access state.
   */
  const canAccessRoute =
    useMemo(() => {
      return Boolean(
        isAuthenticated
      );
    }, [isAuthenticated]);

  /**
   * Block rendering during
   * auth session restoration.
   *
   * Prevents:
   * - redirect flickers
   * - stale auth redirects
   * - route hydration mismatches
   */
  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="rounded-2xl bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Loading Spinner */}
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />

            <p className="text-sm font-medium text-gray-600">
              Restoring your
              session...
            </p>
          </div>
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