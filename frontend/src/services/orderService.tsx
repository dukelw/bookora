// services/orderService.ts
import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/orders`;

export const orderService = {
  // Tạo order mới
  async createOrder(data: {
    items: OrderItem[];
    selectedItems: string[];
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
    discountCode?: string;
    user: string;
    paymentMethod: string;
    shippingAddress: ShippingAddress;
    cart: string;
  }) {
    const res: AxiosResponse = await api.post(API_URL, data);
    return res.data;
  },

  // Lấy danh sách order của user
  async getOrdersByUser(userId: string) {
    const res: AxiosResponse = await api.get(`${API_URL}/user/${userId}`);
    return res.data;
  },

  // Lấy chi tiết 1 order
  async getOrder(id: string) {
    const res: AxiosResponse = await api.get(`${API_URL}/${id}`);
    return res.data;
  },

  // Cập nhật trạng thái order
  async updateOrderStatus(id: string, status: string) {
    const res: AxiosResponse = await api.patch(`${API_URL}/${id}/status`, {
      status,
    });
    return res.data;
  },
};
