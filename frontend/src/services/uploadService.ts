import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/cloudinary`;

export const uploadService = {
  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res: AxiosResponse = await api.post(`${API_URL}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.url;
  },
};
