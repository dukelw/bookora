import { removeAccessToken, setAccessToken } from "@/utils/token";
import { api } from "@/lib/axios";

import axios, { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/payment`;

export const paymentService = {
  async payWithMomo(amount: number, redirectUrl?: string) {
    try {
      const response: AxiosResponse = await axios.post(`${API_URL}/momo`, {
        amount,
        redirectUrl,
      });

      return response;
    } catch (error) {
      throw new Error("Failed to pay with Momo");
    }
  },
};
