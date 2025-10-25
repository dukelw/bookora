// services/orderService.ts
import OrderItem from "@/interfaces/OrderItem";
import { api } from "../lib/axios";
import { AxiosResponse } from "axios";
import ShippingAddress from "@/interfaces/ShippingAddress";

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
  async getOrdersByUser(
    userId: string,
    { page = 1, limit = 10, status = "" } = {}
  ) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (status) params.append("status", status);

    const res = await api.get(`${API_URL}/user/${userId}?${params.toString()}`);
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

  async getAllOrders({
    page = 1,
    limit = 10,
    status = "",
    userId = "",
  }: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
  } = {}) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (status) params.append("status", status);
    if (userId) params.append("userId", userId);

    const res: AxiosResponse = await api.get(
      `${API_URL}/all?${params.toString()}`
    );
    return res.data;
  },
};
