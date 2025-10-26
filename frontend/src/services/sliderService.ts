import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/sliders`;

export const sliderService = {
  // Tạo slider mới
  async createSlider(data: {
    title: string;
    image: string;
    description?: string;
    collection: string;
  }) {
    const res: AxiosResponse = await api.post(API_URL, data);
    return res.data;
  },

  // Lấy tất cả slider
  async getSliders() {
    const res: AxiosResponse = await api.get(API_URL);
    return res.data;
  },

  // Lấy slider theo ID
  async getSlider(id: string) {
    const res: AxiosResponse = await api.get(`${API_URL}/${id}`);
    return res.data;
  },

  // Xóa slider theo ID
  async removeSlider(id: string) {
    const res: AxiosResponse = await api.delete(`${API_URL}/${id}`);
    return res.data;
  },

  // Bật / tắt active
  async setActive(id: string, active: boolean) {
    const res: AxiosResponse = await api.post(`${API_URL}/${id}/active`, {
      active,
    });
    return res.data;
  },
};
