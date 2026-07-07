import { apiEndpoints } from "../api/endpoints";
import { http } from "./http";

const conversationBase = apiEndpoints.conversations.list;

export const chatService = {
  async listConversations() {
    const response = await http.get(conversationBase);

    return response.data?.conversations || [];
  },

  async createConversation({ instagramAccountId, title }) {
    const response = await http.post(conversationBase, {
      instagramAccountId,
      title,
    });

    return response.data?.conversation;
  },

  async getMessages(conversationId) {
    const response = await http.get(`${conversationBase}/${conversationId}/messages`);

    return response.data?.messages || [];
  },

  async sendMessage({ conversationId, message }) {
    const response = await http.post(`${conversationBase}/${conversationId}/chat`, {
      message,
    });

    return response.data?.reply;
  },

  async renameConversation({ conversationId, title }) {
    const response = await http.patch(`${conversationBase}/${conversationId}`, {
      title,
    });

    return response.data?.conversation;
  },

  async deleteConversation(conversationId) {
    const response = await http.delete(`${conversationBase}/${conversationId}`);

    return response.data?.conversation;
  },

  async restoreConversation(conversationId) {
    const response = await http.patch(`${conversationBase}/${conversationId}/restore`);

    return response.data?.conversation;
  },
};
