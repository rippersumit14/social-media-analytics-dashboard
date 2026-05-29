import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  loginUser as loginUserService,

  registerUser as registerUserService,

  getCurrentUser as getCurrentUserService,
} from "../services/authService.js";

const AuthContext =
  createContext(null);

/**
 * Stable token storage key.
 */
const TOKEN_KEY = "token";

/**
 * Production-grade authentication provider.
 *
 * Responsibilities:
 * - auth persistence
 * - auth hydration
 * - login lifecycle
 * - register lifecycle
 * - logout lifecycle
 * - session restoration
 * - auth synchronization
 */
export const AuthProvider = ({
  children,
}) => {
  /**
   * Authenticated user state.
   */
  const [user, setUser] =
    useState(null);

  /**
   * Persisted auth token.
   */
  const [token, setToken] =
    useState(
      localStorage.getItem(
        TOKEN_KEY
      ) || null
    );

  /**
   * Auth hydration lifecycle.
   */
  const [
    hydrationLoading,
    setHydrationLoading,
  ] = useState(true);

  /**
   * Auth action lifecycle.
   */
  const [authLoading, setAuthLoading] =
    useState(false);

  /**
   * Hydration guard.
   *
   * Prevents duplicate
   * hydration in strict mode.
   */
  const hasHydratedRef =
    useRef(false);

  /**
   * Persist auth token safely.
   */
  const persistToken =
    useCallback(
      (authToken) => {
        if (!authToken) {
          return;
        }

        localStorage.setItem(
          TOKEN_KEY,
          authToken
        );

        setToken(authToken);
      },
      []
    );

  /**
   * Stable auth cleanup.
   */
  const clearAuth =
    useCallback(() => {
      localStorage.removeItem(
        TOKEN_KEY
      );

      setToken(null);

      setUser(null);
    }, []);

  /**
   * Restore authenticated session.
   */
  useEffect(() => {
    /**
     * Prevent strict mode
     * double hydration.
     */
    if (
      hasHydratedRef.current
    ) {
      return;
    }

    hasHydratedRef.current =
      true;

    /**
     * No token available.
     */
    if (!token) {
      setHydrationLoading(
        false
      );

      return;
    }

    const controller =
      new AbortController();

    const hydrateUser =
      async () => {
        try {
          setHydrationLoading(
            true
          );

          const response =
            await getCurrentUserService(
              {
                signal:
                  controller.signal,
              }
            );

          /**
           * Stable backend contract.
           */
          setUser(
            response.data
          );
        } catch (error) {
          /**
           * Ignore cancelled hydration.
           */
          if (
            error.cancelled
          ) {
            return;
          }

          console.error(
            "[AUTH HYDRATION ERROR]",
            error
          );

          /**
           * Invalid token cleanup.
           */
          clearAuth();
        } finally {
          setHydrationLoading(
            false
          );
        }
      };

    hydrateUser();

    /**
     * Cleanup hydration safely.
     */
    return () => {
      controller.abort();
    };
  }, [
    token,
    clearAuth,
  ]);

  /**
   * Login existing user.
   */
  const login =
    useCallback(
      async (formData) => {
        try {
          setAuthLoading(
            true
          );

          const response =
            await loginUserService(
              {
                userData:
                  formData,
              }
            );

          /**
           * Stable backend contract.
           */
          const authData =
            response.data ||
            {};

          persistToken(
            authData.token
          );

          setUser(
            authData.user
          );

          return response;
        } finally {
          setAuthLoading(
            false
          );
        }
      },
      [persistToken]
    );

  /**
   * Register new user.
   */
  const register =
    useCallback(
      async (formData) => {
        try {
          setAuthLoading(
            true
          );

          const response =
            await registerUserService(
              {
                userData:
                  formData,
              }
            );

          /**
           * Stable backend contract.
           */
          const authData =
            response.data ||
            {};

          persistToken(
            authData.token
          );

          setUser(
            authData.user
          );

          return response;
        } finally {
          setAuthLoading(
            false
          );
        }
      },
      [persistToken]
    );

  /**
   * Logout authenticated user.
   */
  const logout =
    useCallback(() => {
      clearAuth();
    }, [clearAuth]);

  /**
   * Stable authentication state.
   */
  const isAuthenticated =
    useMemo(() => {
      return Boolean(
        user && token
      );
    }, [user, token]);

  /**
   * Stable provider value.
   */
  const value = useMemo(
    () => ({
      /**
       * Auth state.
       */
      user,

      token,

      isAuthenticated,

      /**
       * Lifecycle states.
       */
      hydrationLoading,

      authLoading,

      /**
       * Actions.
       */
      login,

      register,

      logout,
    }),
    [
      user,
      token,
      isAuthenticated,
      hydrationLoading,
      authLoading,
      login,
      register,
      logout,
    ]
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Stable auth context hook.
 */
export const useAuth = () => {
  return useContext(
    AuthContext
  );
};