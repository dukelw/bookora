/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/wishlist`;

export const wishlistService = {
  async list(params?: { page?: number; limit?: number }) {
    const res: AxiosResponse = await api.get(API_URL, { params });
    return res.data as { items: any[]; meta?: any };
  },

  async add(bookId: string) {
    const res: AxiosResponse = await api.post(API_URL, { bookId });
    return res.data;
  },

  async addMany(bookIds: string[]) {
    const res: AxiosResponse = await api.post(`${API_URL}/bulk`, { bookIds });
    return res.data;
  },

  async toggle(bookId: string) {
    const res: AxiosResponse = await api.post(`${API_URL}/toggle`, { bookId });
    return res.data as { inWishlist: boolean };
  },

  async status(bookId: string) {
    const res: AxiosResponse = await api.get(`${API_URL}/status/${bookId}`);
    return res.data as { inWishlist: boolean };
  },

  async remove(bookId: string) {
    const res: AxiosResponse = await api.delete(`${API_URL}/${bookId}`);
    return res.data;
  },

  async removeMany(bookIds: string[]) {
    const res: AxiosResponse = await api.delete(API_URL, { data: { bookIds } });
    return res.data;
  },

  async clear() {
    const res: AxiosResponse = await api.delete(`${API_URL}/clear/all`);
    return res.data;
  },
};
