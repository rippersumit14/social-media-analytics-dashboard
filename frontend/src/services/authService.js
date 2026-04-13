import api from "./api.js";

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

/**
 * Login existing user
 */
export const loginUser = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};

/**
 * Get current authenticated user using JWT token
 */
export const getCurrentUser = async (token) => {
  const response = await api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};