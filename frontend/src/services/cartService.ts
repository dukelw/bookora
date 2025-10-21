import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/cart`;

export const cartService = {
  // Lấy giỏ hàng
  async getCart(userId: string) {
    const res: AxiosResponse = await api.get(API_URL, {
      params: { userId },
    });
    return res.data;
  },

  async mergeCart(userId: string, guestId: string) {
    const res: AxiosResponse = await api.post(`${API_URL}/merge`, {
      userId,
      guestId,
    });
    return res.data;
  },

  // Lấy tổng hợp giỏ hàng (tổng tiền, thuế, phí ship)
  async cartSummary(userId: string) {
    const res: AxiosResponse = await api.get(`${API_URL}/summary`, {
      params: { userId },
    });
    return res.data;
  },

  // Thêm sách vào giỏ
  async addToCart(data: {
    userId: string;
    bookId: string;
    variantId: string;
    quantity: number;
  }) {
    const res: AxiosResponse = await api.post(API_URL, data);
    return res.data;
  },

  // Cập nhật số lượng sách trong giỏ
  async updateItem(data: {
    userId: string;
    bookId: string;
    variantId: string;
    quantity: number;
  }) {
    const res: AxiosResponse = await api.put(API_URL, data);
    return res.data;
  },

  // Cập nhật trạng thái sách trong giỏ
  async updateItemStatus(data: {
    userId: string;
    bookId: string;
    variantId: string;
    status: "pending" | "purchased";
  }) {
    const res: AxiosResponse = await api.put(`${API_URL}/item-status`, data);
    return res.data;
  },

  // Xóa sách khỏi giỏ theo bookId + variantId
  async removeItem(userId: string, bookId: string, variantId: string) {
    const res: AxiosResponse = await api.delete(
      `${API_URL}/${bookId}/${variantId}`,
      {
        data: { userId },
      }
    );
    return res.data;
  },

  // Tăng/Giảm số lượng sách trong giỏ (±1)
  async adjustItem(data: {
    userId: string;
    bookId: string;
    variantId: string;
    action: "increment" | "decrement";
  }) {
    const res: AxiosResponse = await api.put(`${API_URL}/adjust`, data);
    return res.data;
  },
};
