/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
} from "@/utils/token";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ✅ FIX: Đọc đúng key "refreshToken" (không có underscore)
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // ✅ FIX: Gửi đúng field "token" như backend mong đợi (RefreshTokenDto)
        const res = await api.post("/auth/refresh", {
          token: refreshToken,
        });

        // ✅ FIX: Backend trả về { accessToken, refreshToken }
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          res.data;

        // Lưu cả 2 token mới
        setAccessToken(newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Cập nhật cookie qua API route (nếu bạn dùng)
        try {
          await axios.post("/api/login", {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });
        } catch (cookieError) {
          console.warn("Failed to update cookies:", cookieError);
        }

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        console.error("Token refresh failed:", err);
        processQueue(err, null);

        // Xóa tất cả tokens và cookies
        removeAccessToken();
        localStorage.removeItem("refreshToken");

        try {
          await axios.post("/api/logout");
        } catch (logoutError) {
          console.warn("Logout failed:", logoutError);
        }

        // Redirect to login page
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
