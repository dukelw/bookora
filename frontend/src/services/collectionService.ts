import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/slider-collections`;

export const collectionService = {
  // Tạo collection mới
  async createCollection(data: { name: string }) {
    const res: AxiosResponse = await api.post(API_URL, data);
    return res.data;
  },

  // Lấy danh sách tất cả collection
  async getCollections(params?: {
    keySearch?: string;
    page?: number;
    limit?: number;
  }) {
    return api.get(API_URL, { params }).then((res) => res.data);
  },

  // Lấy danh sách collection đang active (và slider active kèm theo)
  async getActiveCollections() {
    const res: AxiosResponse = await api.get(`${API_URL}/active`);
    return res.data;
  },

  // Lấy collection theo ID
  async getCollection(id: string) {
    const res: AxiosResponse = await api.get(`${API_URL}/${id}`);
    return res.data;
  },

  // Xóa collection theo ID
  async removeCollection(id: string) {
    const res: AxiosResponse = await api.delete(`${API_URL}/${id}`);
    return res.data;
  },

  // Bật / tắt trạng thái active
  async setActive(id: string, active: boolean) {
    const res: AxiosResponse = await api.post(`${API_URL}/${id}/active`, {
      active,
    });
    return res.data;
  },
};
