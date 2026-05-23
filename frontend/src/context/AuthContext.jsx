import {
  createContext,
  useContext,
  useEffect,
  useMemo,
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
 * Handles:
 * - auth persistence
 * - auth hydration
 * - login/register lifecycle
 * - logout lifecycle
 * - token synchronization
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
   * Global auth loading state.
   */
  const [loading, setLoading] =
    useState(false);

  /**
   * Persist token safely.
   */
  const persistToken = (
    authToken
  ) => {
    if (!authToken) {
      return;
    }

    localStorage.setItem(
      TOKEN_KEY,
      authToken
    );

    setToken(authToken);
  };

  /**
   * Clear auth lifecycle safely.
   */
  const clearAuth = () => {
    localStorage.removeItem(
      TOKEN_KEY
    );

    setToken(null);

    setUser(null);
  };

  /**
   * Restore authenticated session.
   */
  useEffect(() => {
    /**
     * No token available.
     */
    if (!token) {
      return;
    }

    const controller =
      new AbortController();

    const hydrateUser =
      async () => {
        try {
          setLoading(true);

          const response =
            await getCurrentUserService(
              {
                token,

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
          setLoading(false);
        }
      };

    hydrateUser();

    /**
     * Cleanup hydration safely.
     */
    return () => {
      controller.abort();
    };
  }, [token]);

  /**
   * Login existing user.
   */
  const login = async (
    formData
  ) => {
    const response =
      await loginUserService({
        userData:
          formData,
      });

    /**
     * Stable backend contract.
     */
    const authData =
      response.data || {};

    persistToken(
      authData.token
    );

    setUser(authData.user);

    return response;
  };

  /**
   * Register new user.
   */
  const register =
    async (formData) => {
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
        response.data || {};

      persistToken(
        authData.token
      );

      setUser(
        authData.user
      );

      return response;
    };

  /**
   * Logout authenticated user.
   */
  const logout = () => {
    clearAuth();
  };

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
      user,

      token,

      loading,

      login,

      register,

      logout,

      isAuthenticated,
    }),
    [
      user,
      token,
      loading,
      isAuthenticated,
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