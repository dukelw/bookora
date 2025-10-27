import { removeAccessToken, setAccessToken } from "@/utils/token";
import { api } from "@/lib/axios";

import axios, { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth`;

export const authService = {
  async signUp(fullname: string, email: string, password: string, address: string) {
    try {
      const response: AxiosResponse = await axios.post(`${API_URL}/signup`, {
        email,
        address,
        password,
        fullname,
      });

      return response;
    } catch (error) {
      throw new Error("Failed to sign up");
    }
  },

  // Đăng nhập
  async signIn(email: string, password: string) {
    try {
      const response: AxiosResponse = await axios.post(`${API_URL}/signin`, {
        email,
        password,
      });
      const { tokens } = response.data;

      // Lưu token vào localStorage và cookie
      setAccessToken(tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken); // Lưu refresh token vào localStorage

      await axios.post("/api/login", {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  async signInOAuth(email: string, name: string, image?: string) {
    try {
      const response: AxiosResponse = await axios.post(`${API_URL}/oauth`, {
        email,
        name,
        image,
      });
      console.log(email, name, image, response);

      const { tokens } = response.data;

      // Lưu token vào localStorage và cookie
      setAccessToken(tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken); // Lưu refresh token vào localStorage

      await axios.post("/api/login", {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      return response.data;
    } catch (error) {
      console.error("OAuth login failed:", error);
      throw new Error("OAuth login failed");
    }
  },

  async logout() {
    try {
      await axios.post("/api/logout");

      removeAccessToken();
      localStorage.removeItem("refreshToken");
    } catch (error) {
      throw new Error("Failed to log out");
    }
  },

  // ✅ FIX: Làm mới token tự động (gọi đúng field "token")
  async refreshTokens(refreshTokenParams: string) {
    try {
      const response: AxiosResponse = await axios.post(`${API_URL}/refresh`, {
        token: refreshTokenParams, // ✅ Đổi từ "refreshToken" thành "token"
      });
      const { accessToken, refreshToken } = response.data;

      // Lưu token mới
      setAccessToken(accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Cập nhật cookie
      await axios.post("/api/login", {
        accessToken,
        refreshToken,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to refresh tokens"
      );
    }
  },

  // Gửi yêu cầu gửi mã OTP qua email
  async requestResetPassword(email: string) {
    try {
      const res = await axios.post(`${API_URL}/forgot`, { email });
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to request OTP"
      );
    }
  },

  // Xác thực mã OTP và lấy resetPasswordToken
  async verifyOtp(email: string, otp: string) {
    try {
      const res = await axios.post(`${API_URL}/verify-otp`, { email, otp });
      return res.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "Failed to verify OTP");
    }
  },

  // Đặt lại mật khẩu bằng resetPasswordToken
  async resetPassword(resetPasswordToken: string, newPassword: string) {
    try {
      const res = await axios.post(`${API_URL}/reset-password`, {
        resetPasswordToken,
        newPassword,
      });
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to reset password"
      );
    }
  },

  // Đổi mật khẩu khi đang đăng nhập
  async changePassword(oldPassword: string, newPassword: string) {
    try {
      const res = await api.post(`${API_URL}/change-password`, {
        oldPassword,
        newPassword,
      });
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to change password"
      );
    }
  },

  async registerFromCheckout(data: {
    email: string;
    name?: string;
    phone?: string;
    address?: string;
  }) {
    const res = await axios.post(`${API_URL}/register-from-checkout`, data);
    const { tokens, user } = res.data;
    if (tokens?.accessToken) {
      setAccessToken(tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      // also set server-side cookies/session if you have Next.js API route /api/login
      await axios.post("/api/login", {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    }
    return { user, tokens };
  },
};
