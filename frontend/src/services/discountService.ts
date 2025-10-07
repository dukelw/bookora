import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/discounts`;

export const discountService = {
  // 🧾 Lấy danh sách tất cả discount (admin)
  async getAll() {
    const res: AxiosResponse = await api.get(API_URL);
    return res.data;
  },

  // ➕ Tạo mới discount (admin)
  async create(data: {
    code: string;
    type: "percentage" | "fixed";
    value: number;
    startDate: string;
    endDate: string;
    minOrderValue?: number;
  }) {
    const res: AxiosResponse = await api.post(API_URL, data);
    return res.data;
  },

  // ✏️ Cập nhật discount theo ID (admin)
  async update(id: string, data: any) {
    const res: AxiosResponse = await api.put(`${API_URL}/${id}`, data);
    return res.data;
  },

  // 🔁 Bật/tắt trạng thái hoạt động của discount (admin)
  async toggleStatus(id: string) {
    const res: AxiosResponse = await api.patch(`${API_URL}/${id}/status`);
    return res.data;
  },

  // 🎟️ Áp dụng mã giảm giá (người dùng)
  async applyDiscount(code: string, orderTotal: number) {
    const res: AxiosResponse = await api.post(`${API_URL}/apply/${code}`, {
      orderTotal,
    });
    return res.data;
  },
};
