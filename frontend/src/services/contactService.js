import { apiEndpoints } from "../api/endpoints";
import { http } from "./http";

export const contactService = {
  async submitContact(payload) {
    const response = await http.post(apiEndpoints.contact.submit, payload);

    return response.data;
  },
};
