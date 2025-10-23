import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

export const addressService = {
  async getAddresses(): Promise<any> {
    const res: AxiosResponse = await api.get(`${API_URL}/user/addresses`);
    return res.data;
  },

  async changeShippingAddress(dto: any): Promise<any> {
    const res: AxiosResponse = await api.post(`${API_URL}/user/change-shipping-address`, dto);
    return res.data;
  },
  
  async removeAddress(address: string): Promise<any> {
    const res: AxiosResponse = await api.post(`${API_URL}/user/remove-address`, {address});
    return res.data;
  },

  async list(): Promise<any> {
    const res: AxiosResponse = await api.get(`${API_URL}/addresses`);
    return res.data;
  },

  async create(dto: any): Promise<any> {
    const res: AxiosResponse = await api.post(`${API_URL}/addresses`, dto);
    return res.data;
  },

  async update(id: string, dto: any): Promise<any> {
    const res: AxiosResponse = await api.patch(`${API_URL}/addresses/${id}`, dto);
    return res.data;
  },

  async remove(id: string): Promise<any> {
    const res: AxiosResponse = await api.delete(`${API_URL}/addresses/${id}`);
    return res.data;
  },

  async setDefault(id: string): Promise<any> {
    const res: AxiosResponse = await api.patch(`${API_URL}/addresses/${id}/default`);
    return res.data;
  },

  // Khách chưa có tài khoản tạo địa chỉ
  async guestCreate(email: string, address: any): Promise<any> {
    const res: AxiosResponse = await api.post(`${API_URL}/checkout/guest-address`, { email, address });
    return res.data;
  },
};
