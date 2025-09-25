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
};
