import { api } from "@/lib/axios";
import axios, { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/user`;

export const userService = {
  // Lấy thông tin người dùng
  async getProfile() {
    try {
      const res: AxiosResponse = await api.get(`${API_URL}/profile`);
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to get profile"
      );
    }
  },

  // Cập nhật thông tin người dùng
  async updateProfile(updateUserDto: {
    name?: string;
    address?: string;
    avatar?: string;
    shippingAddress?: string;
  }) {
    try {
      const res: AxiosResponse = await api.put(`${API_URL}/me`, updateUserDto);
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to update profile"
      );
    }
  },

  // ========== Admin ==========
  // Lấy danh sách tất cả người dùng (admin)
  async getUsers(
    keySearch?: string,
    page?: number,
    limit?: number,
    status?: string | undefined,
    role?: string | undefined
  ) {
    const res: AxiosResponse = await api.get(API_URL, {
      params: { keySearch, page, limit, status, role },
    });
    return res.data;
  },

  // Cập nhật người dùng (admin)
  async updateUser(id: string, data: any) {
    const res: AxiosResponse = await api.put(`${API_URL}/${id}`, data);
    return res.data;
  },

  // Cập nhật trạng thái user (chỉ Admin có quyền)
  async updateStatus(id: string, data: { status: "active" | "inactive" }) {
    const res: AxiosResponse = await api.patch(`${API_URL}/${id}/status`, data);
    return res.data;
  },

  // Lấy thông tin người dùng theo ID (Admin)
  async getUserById(id: string) {
    try {
      const res: AxiosResponse = await api.get(`${API_URL}/${id}`);
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to get user by ID"
      );
    }
  },
};
