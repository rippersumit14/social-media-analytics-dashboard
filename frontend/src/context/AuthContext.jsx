import { createContext, useContext, useEffect, useState } from "react";
import {
  loginUser as loginUserService,
  registerUser as registerUserService,
  getCurrentUser as getCurrentUserService,
} from "../services/authService.js";

const AuthContext = createContext(null);

/**
 * Global authentication provider.
 * Handles: 
 * - token persistence
 * - loading current user on refresh
 * - login
 * - register
 * - logout
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const data = await getCurrentUserService(token);
        setUser(data.user);
      } catch (error) {
        console.error("Failed to load current user:", error);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  /**
   * Login user and store token
   */
  const login = async (formData) => {
    const data = await loginUserService(formData);
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  /**
   * Register user and store token
   */
  const register = async (formData) => {
    const data = await registerUserService(formData);
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  /**
   * Logout user
   */
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook for auth context usage
 */
export const useAuth = () => {
  return useContext(AuthContext);
};