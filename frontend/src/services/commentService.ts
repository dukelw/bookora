import { AxiosResponse } from "axios";
import { api } from "../lib/axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/comments`;

export const commentService = {
  // 🟢 Lấy danh sách bình luận theo bookId
  // async getByBook(bookId: string) {
  //   const res: AxiosResponse<Comment[]> = await api.get(`${API_URL}/${bookId}`);
  //   return res.data;
  // },

  // lấy top-level comments (paginated)
  async getByBook(bookId: string, page = 1, limit = 5) {
    const res = await api.get(
      `/comments/${bookId}?page=${page}&limit=${limit}`
    );
    return res.data; // { comments, total, hasMore, page, limit }
  },

  // lấy replies (all descendants) cho 1 parent comment
  async getReplies(bookId: string, parentId: string) {
    const res = await api.get(`/comments/${bookId}/replies/${parentId}`);
    return res.data; // array of replies
  },

  // 🟡 Tạo bình luận mới
  async create(data: {
    user?: string;
    bookId: string;
    content: string;
    parentComment?: string;
  }) {
    const res: AxiosResponse<Comment> = await api.post(API_URL, data);
    return res.data;
  },

  // 🟠 Cập nhật bình luận
  async update(id: string, content: string) {
    const res: AxiosResponse<Comment> = await api.put(`${API_URL}/${id}`, {
      content,
    });
    return res.data;
  },

  // 🔴 Xóa bình luận
  async remove(id: string): Promise<{ message: string }> {
    const res: AxiosResponse<{ message: string }> = await api.delete(
      `${API_URL}/${id}`
    );
    return res.data;
  },
};
