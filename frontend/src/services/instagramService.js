import { apiEndpoints } from "../api/endpoints";
import { http } from "./http";

export const instagramService = {
  async syncMedia() {
    return http.post(apiEndpoints.instagram.mediaSync);
  },
};
