import { Rating } from "@/interfaces/Rating";
import { api } from "@/lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/rating`;

export interface CreateRatingDto {
  stars: number; // số sao (1–5)
  comment?: string;
}

export const ratingService = {
  // 🧠 Lấy tất cả đánh giá của 1 quyển sách
  async getRatings(bookId: string): Promise<Rating[]> {
    try {
      const res: AxiosResponse<Rating[]> = await api.get(
        `${API_URL}/${bookId}`
      );
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Không thể lấy danh sách đánh giá"
      );
    }
  },

  // 🧍‍♀️ Lấy đánh giá của chính user đang đăng nhập cho 1 sách
  async getMyRating(bookId: string): Promise<Rating | null> {
    try {
      const res: AxiosResponse<Rating> = await api.get(
        `${API_URL}/${bookId}/me`
      );
      return res.data;
    } catch (error: any) {
      if (error?.response?.status === 404) return null;
      throw new Error(
        error?.response?.data?.message || "Không thể lấy đánh giá của bạn"
      );
    }
  },

  // ✍️ Thêm mới đánh giá
  async addRating(bookId: string, dto: CreateRatingDto): Promise<Rating> {
    try {
      const res: AxiosResponse<Rating> = await api.post(
        `${API_URL}/${bookId}`,
        dto
      );
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Không thể thêm đánh giá"
      );
    }
  },

  // 🔁 Cập nhật lại đánh giá
  async updateRating(bookId: string, dto: CreateRatingDto): Promise<Rating> {
    try {
      const res: AxiosResponse<Rating> = await api.put(
        `${API_URL}/${bookId}`,
        dto
      );
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Không thể cập nhật đánh giá"
      );
    }
  },

  // ⭐ Lấy điểm trung bình
  async getAverageRating(
    bookId: string
  ): Promise<{ avgStars: number; count: number }> {
    try {
      const res: AxiosResponse<{ avgStars: number; count: number }> =
        await api.get(`${API_URL}/${bookId}/average`);
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Không thể lấy điểm trung bình"
      );
    }
  },
};
