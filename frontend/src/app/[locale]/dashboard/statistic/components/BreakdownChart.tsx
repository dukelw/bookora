"use client";

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/utils/format";
import { PieChart } from "lucide-react";
import { useTranslations } from "use-intl";

export default function BreakdownChart({ data }: any) {
  const t = useTranslations("dashboard.statistic");
  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-800">
          {t("categoryBreakdown")}
        </h2>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <ReBarChart data={data}>
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip formatter={(val) => formatCurrency(val as number)} />
          <Legend />
          <Bar dataKey="quantity" fill="#3b82f6" name={t("quantity")} />
          <Bar dataKey="revenue" fill="#22c55e" name={t("revenue")} />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
