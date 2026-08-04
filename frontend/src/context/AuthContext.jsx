import { useCallback, useEffect, useMemo, useState } from "react";

import { setUnauthorizedHandler } from "../api/client";
import { authService } from "../services/authService";
import { clearStoredToken, getStoredToken, storeToken } from "../utils/authStorage";
import { AuthContext } from "./authContextValue";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  const clearAuthState = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const activeToken = getStoredToken();

    if (!activeToken) {
      clearAuthState();
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);

    try {
      const response = await authService.getCurrentUser();
      setUser(response.data);
      setToken(activeToken);
      return response.data;
    } catch {
      clearAuthState();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthState]);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    const nextToken = response.data?.token;
    const nextUser = response.data?.user;

    if (!nextToken || !nextUser) {
      throw new Error("Login response did not include a user session.");
    }

    storeToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);

    return response;
  }, []);

  const register = useCallback(async (payload) => {
    return authService.register(payload);
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    const response = await authService.loginWithGoogle({ credential });
    const nextToken = response.data?.token;
    const nextUser = response.data?.user;

    if (!nextToken || !nextUser) {
      throw new Error("Google login response did not include a user session.");
    }

    storeToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);

    return response;
  }, []);

  const logout = useCallback(() => {
    clearAuthState();
  }, [clearAuthState]);

  useEffect(() => {
    setUnauthorizedHandler(clearAuthState);

    return () => setUnauthorizedHandler(null);
  }, [clearAuthState]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      loginWithGoogle,
      register,
      logout,
      refreshUser,
    }),
    [isLoading, login, loginWithGoogle, logout, refreshUser, register, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
