import axios, { AxiosResponse } from "axios";

export interface SendMailPayload {
  to: string;
  subject: string;
  name?: string;
  content: string;
}

export const mailService = {
  async sendMail(data: SendMailPayload) {
    const res: AxiosResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/mail/send`, data);
    return res.data;
  },
};