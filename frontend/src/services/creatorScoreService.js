import { apiEndpoints } from "../api/endpoints";
import { http } from "./http";

export const creatorScoreService = {
  async calculate() {
    return http.post(apiEndpoints.creatorScore.calculate);
  },
};
