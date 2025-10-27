import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/stats`;

export const statisticService = {
  /**
   * Lấy overview dashboard (tổng quan)
   * @param params TimeRangeDto
   */
  async getOverview(params?: {
    from?: string;
    to?: string;
    granularity?: "year" | "quarter" | "month" | "week";
    tz?: string;
    limit?: number;
    profitMode?: "none" | "variant" | "book";
  }) {
    const res: AxiosResponse = await api.get(`${API_URL}/overview`, { params });
    return res.data;
  },

  /**
   * Lấy dữ liệu time-series (doanh thu, đơn hàng,... theo thời gian)
   * @param params TimeRangeDto
   */
  async getTimeSeries(params?: {
    from?: string;
    to?: string;
    granularity?: "year" | "quarter" | "month" | "week";
    tz?: string;
    profitMode?: "none" | "variant" | "book";
  }) {
    const res: AxiosResponse = await api.get(`${API_URL}/time-series`, {
      params,
    });
    return res.data;
  },

  /**
   * Lấy top sản phẩm bán chạy nhất
   * @param params TopProductsDto
   */
  async getTopProducts(params?: {
    from?: string;
    to?: string;
    granularity?: "year" | "quarter" | "month" | "week";
    tz?: string;
    limit?: number;
    profitMode?: "none" | "variant" | "book";
  }) {
    const res: AxiosResponse = await api.get(`${API_URL}/top-products`, {
      params,
    });
    return res.data;
  },

  /**
   * Lấy thống kê breakdown theo category (so sánh qua các kỳ)
   * @param params TimeRangeDto
   */
  async getProductBreakdown(params?: {
    from?: string;
    to?: string;
    granularity?: "year" | "quarter" | "month" | "week";
    tz?: string;
    profitMode?: "none" | "variant" | "book";
  }) {
    const res: AxiosResponse = await api.get(`${API_URL}/product-breakdown`, {
      params,
    });
    return res.data;
  },
};
