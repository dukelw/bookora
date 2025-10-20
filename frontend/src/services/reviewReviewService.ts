import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const REVIEW_REQUEST_URL = `${process.env.NEXT_PUBLIC_API_URL}/review-requests`;

export const reviewRequestService = {
  // Lấy tất cả review requests của 1 user
  async getAllByUser(userId: string) {
    const res: AxiosResponse = await api.get(
      `${REVIEW_REQUEST_URL}/user/${userId}`
    );
    return res.data;
  },

  // Đánh dấu review request là hoàn thành
  async markAsComplete(id: string) {
    const res: AxiosResponse = await api.post(
      `${REVIEW_REQUEST_URL}/${id}/complete`
    );
    return res.data;
  },
};
