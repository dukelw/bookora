import LoyaltyBalance from "@/interfaces/LoyaltyBalance";
import { api } from "@/lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/loyalty`;

export interface LoyaltyHistoryQuery {
  page?: number;
  limit?: number;
  sort?: string;
  startDate?: string;
  endDate?: string;
  type?: string; // optional: earn/spend
}

export const loyaltyService = {
  // 🧾 Lấy số dư điểm thưởng hiện tại của user
  async getBalance(): Promise<LoyaltyBalance> {
    try {
      const response: AxiosResponse = await api.get(`${API_URL}/balance`);
      return response.data; // backend return có thể là { balance: 100 }
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to fetch loyalty balance"
      );
    }
  },

  // 📜 Lấy lịch sử giao dịch điểm thưởng (có phân trang)
  async getHistory(query?: LoyaltyHistoryQuery) {
    try {
      const response: AxiosResponse = await api.get(`${API_URL}/history`, {
        params: query,
      });
      return response.data; // backend return { items, total, page, limit, ... }
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          "Failed to fetch loyalty transaction history"
      );
    }
  },
};
