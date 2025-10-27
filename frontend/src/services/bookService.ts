import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/books`;

export const bookService = {
  // ========== Book ==========
  async createBook(data: {
    title: string;
    author?: string;
    publisher?: string;
    category: string[];
    description?: string;
    releaseYear?: number;
    images?: { url: string; isMain?: boolean; order?: number }[];
    variants?: {
      rarity: "common" | "rare" | "limited";
      price: number;
      stock: number;
      isbn?: string;
    }[];
  }) {
    const res: AxiosResponse = await api.post(API_URL, data);
    return res.data;
  },

  async getBooks(keySearch?: string, page?: number, limit?: number) {
    const res: AxiosResponse = await api.get(API_URL, {
      params: { keySearch, page, limit },
    });
    return res.data;
  },

  async getBooksByCategory(categoryId?: string, page?: number, limit?: number) {
    const res: AxiosResponse = await api.get(
      `${API_URL}/by-category/${categoryId}`,
      {
        params: { page, limit },
      }
    );
    return res.data;
  },

  async getBestSellers(params?: {
    limit?: number;
    from?: string;
    to?: string;
    category?: string;
    author?: string;
    publisher?: string;
  }) {
    const res: AxiosResponse = await api.get(`${API_URL}/best-sellers`, {
      params,
    });
    return res.data;
  },

  async getNewReleases(params?: {
    limit?: number;
    from?: string;
    days?: number;
    category?: string;
    author?: string;
    publisher?: string;
  }) {
    const res: AxiosResponse = await api.get(`${API_URL}/new-releases`, {
      params,
    });
    return res.data;
  },

  async getAuthors(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const res: AxiosResponse = await api.get(`${API_URL}/authors`, { params });
    return res.data;
  },

  async getBooksByAuthor(
    author: string,
    params?: { page?: number; limit?: number }
  ) {
    const res: AxiosResponse = await api.get(
      `${API_URL}/authors/${encodeURIComponent(author)}`,
      { params }
    );
    return res.data;
  },
    
  async getAuthors(params?: {search?: string; page?: number; limit?: number;}) {
    const res: AxiosResponse = await api.get(`${API_URL}/authors`, {params});
    return res.data;
  },

  async getBooksByAuthor(author: string, params?: { page?: number; limit?: number }) {
    const res: AxiosResponse = await api.get(`${API_URL}/authors/${encodeURIComponent(author)}`, {params});
    return res.data;
  },

  async getBook(id: string) {
    const res: AxiosResponse = await api.get(`${API_URL}/${id}`);
    return res.data;
  },

  async updateBook(
    id: string,
    data: {
      title?: string;
      author?: string;
      publisher?: string;
      category?: string[];
      description?: string;
      releaseYear?: number;
      images?: { url: string; isMain?: boolean; order?: number }[];
      variants?: {
        rarity: "common" | "rare" | "limited";
        price: number;
        stock: number;
        isbn?: string;
      }[];
    }
  ) {
    const res: AxiosResponse = await api.put(`${API_URL}/${id}`, data);
    return res.data;
  },

  async removeBook(id: string) {
    const res: AxiosResponse = await api.delete(`${API_URL}/${id}`);
    return res.data;
  },
};
