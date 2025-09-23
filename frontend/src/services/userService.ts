/* eslint-disable @typescript-eslint/no-unused-vars */
import { api } from "@/lib/axios"; // axios đã config sẵn token
import axios, { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/user`;

export const userService = {
  // ==================== GET PROFILE ====================
  async getProfile() {
    try {
      // gọi API /user/profile (JWT token đã có trong api instance)
      const res: AxiosResponse = await api.get(`${API_URL}/profile`);
      return res.data; // trả về user info
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to get profile"
      );
    }
  },

  // ==================== UPDATE PROFILE ====================
  async updateProfile(updateUserDto: {
    fullName?: string;
    phone?: string;
    address?: string;
    avatar?: string;
    // thêm các trường khác nếu có
  }) {
    try {
      const res: AxiosResponse = await api.put(`${API_URL}/me`, updateUserDto);
      return res.data; // { message: string, user: object }
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to update profile"
      );
    }
  },
};
