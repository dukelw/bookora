"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatCurrency } from "@/utils/format";
import { BarChart3 } from "lucide-react";
import { useTranslations } from "use-intl";

interface TimeSeriesChartProps {
  data: {
    series: {
      key: string;
      period: { label: string };
      metrics: {
        orders: number;
        grossSales: number;
        discounts: number;
        netSales: number;
        shippingRevenue: number;
        productsSold: number;
      };
    }[];
  } | null;
}

export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  const t = useTranslations("dashboard.statistic");
  if (!data || !data.series) return null;

  const chartData = data.series.map((item) => ({
    label: item.period.label,
    revenue: item.metrics.netSales + item.metrics.shippingRevenue,
    orders: item.metrics.orders,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-5 flex items-center gap-2 text-gray-800">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        {t("revenueAndOrdersOverTime", {
          defaultValue: "Revenue & Orders Over Time",
        })}
      </h2>

      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />

          {/* Trục X */}
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />

          {/* Trục Y trái (doanh thu) */}
          <YAxis
            yAxisId="left"
            tickFormatter={(val) =>
              val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
            }
            tick={{ fontSize: 12 }}
            orientation="left"
          />

          {/* Trục Y phải (đơn hàng) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            tickFormatter={(val) => val.toFixed(0)}
          />

          {/* Tooltip hiển thị định dạng đẹp */}
          <Tooltip
            formatter={(val: number, key: string) =>
              key === "orders"
                ? [val, t("orders")]
                : [formatCurrency(val), t("revenue")]
            }
            labelFormatter={(label) => `${t("period")}: ${label}`}
          />

          <Legend />

          {/* Doanh thu */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
            name={t("revenue")}
          />

          {/* Đơn hàng */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
            name={t("orders")}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
