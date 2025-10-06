import { api } from "@/lib/axios";
import axios, { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/footer-images`;

export interface FooterImagePayload {
  title: string;
  description?: string;
  image: string;
  link?: string;
  isActive?: boolean;
  order?: number;
}

export const footerImageService = {
  // Tạo mới footer image
  async create(data: FooterImagePayload) {
    try {
      const response: AxiosResponse = await api.post(`${API_URL}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "Failed to create footer image");
    }
  },

  // Lấy tất cả footer images
  async findAll() {
    try {
      const response: AxiosResponse = await api.get(`${API_URL}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "Failed to fetch footer images");
    }
  },

  // Lấy chi tiết 1 footer image
  async findOne(id: string) {
    try {
      const response: AxiosResponse = await api.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "Failed to fetch footer image");
    }
  },

  // Cập nhật footer image
  async update(id: string, data: Partial<FooterImagePayload>) {
    try {
      const response: AxiosResponse = await api.patch(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "Failed to update footer image");
    }
  },

  // Xóa footer image
  async remove(id: string) {
    try {
      const response: AxiosResponse = await api.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "Failed to delete footer image");
    }
  },

  // Public API: lấy danh sách ảnh đang active
  async getActive() {
    try {
      const response: AxiosResponse = await axios.get(`${API_URL}/public/active`);
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "Failed to fetch active footer images");
    }
  },
};
