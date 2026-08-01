import { apiEndpoints } from "../api/endpoints";
import { http } from "./http";

export const notesService = {
  async list() {
    const response = await http.get(apiEndpoints.notes.list);

    return response.data?.notes || [];
  },

  async create({ title, content, category }) {
    const response = await http.post(apiEndpoints.notes.list, {
      title,
      content,
      category,
    });

    return response.data?.note;
  },

  async update({ noteId, title, content, category }) {
    const response = await http.patch(apiEndpoints.notes.detail(noteId), {
      title,
      content,
      category,
    });

    return response.data?.note;
  },

  async delete(noteId) {
    const response = await http.delete(apiEndpoints.notes.detail(noteId));

    return response.data?.note;
  },

  async archive(noteId) {
    const response = await http.patch(apiEndpoints.notes.archive(noteId));

    return response.data?.note;
  },

  async unarchive(noteId) {
    const response = await http.patch(apiEndpoints.notes.unarchive(noteId));

    return response.data?.note;
  },

  async restore(noteId) {
    const response = await http.patch(apiEndpoints.notes.restore(noteId));

    return response.data?.note;
  },

  async pin(noteId) {
    const response = await http.patch(apiEndpoints.notes.pin(noteId));

    return response.data?.note;
  },

  async unpin(noteId) {
    const response = await http.patch(apiEndpoints.notes.unpin(noteId));

    return response.data?.note;
  },
};
