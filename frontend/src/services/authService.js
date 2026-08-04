import { apiEndpoints } from "../api/endpoints";
import { http } from "./http";

function unwrapResponse(response) {
  return {
    data: response.data,
    message: response.message,
    success: response.success,
    statusCode: response.statusCode,
  };
}

export const authService = {
  async register(payload) {
    return unwrapResponse(await http.post(apiEndpoints.auth.register, payload));
  },

  async login(payload) {
    return unwrapResponse(await http.post(apiEndpoints.auth.login, payload));
  },

  async loginWithGoogle(payload) {
    return unwrapResponse(await http.post(apiEndpoints.auth.google, payload));
  },

  async getCurrentUser() {
    return unwrapResponse(await http.get(apiEndpoints.auth.me));
  },

  async updatePassword(payload) {
    return unwrapResponse(await http.patch(apiEndpoints.auth.password, payload));
  },
};
