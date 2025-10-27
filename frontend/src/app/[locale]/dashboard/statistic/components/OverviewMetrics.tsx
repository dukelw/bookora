'use client'

import React from "react";
import { formatCurrency } from "@/utils/format";
import {
  LucideIcon,
  DollarSign,
  Users,
  Package,
  ShoppingBag,
  LayoutDashboard,
} from "lucide-react";
import { useTranslations } from "use-intl";

const COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-yellow-100 text-yellow-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
  "bg-red-100 text-red-700",
  "bg-emerald-100 text-emerald-700",
];

export default function OverviewMetrics({ totals, range }: any) {
  const t = useTranslations("dashboard.statistic");
  if (!totals) return null;

  const metrics = [
    { label: t("totalUsers"), value: totals.totalUsers, icon: Users },
    { label: t("newUsers"), value: totals.newUsers, icon: Users },
    { label: t("orders"), value: totals.orders, icon: ShoppingBag },
    {
      label: t("grossSales"),
      value: formatCurrency(totals.grossSales),
      icon: DollarSign,
    },
    {
      label: t("discounts"),
      value: formatCurrency(totals.discounts),
      icon: DollarSign,
    },
    {
      label: t("netSales"),
      value: formatCurrency(totals.netSales),
      icon: DollarSign,
    },
    {
      label: t("shippingRevenue"),
      value: formatCurrency(totals.shippingRevenue),
      icon: Package,
    },
    { label: t("productsSold"), value: totals.productsSold, icon: Package },
    { label: t("profit"), value: formatCurrency(totals.profit), icon: DollarSign },
  ];

  return (
    <div className="p-6 shadow rounded-2xl">
      <h2 className="text-2xl font-bold mb-5 flex items-center gap-2 text-gray-800">
        <LayoutDashboard className="w-6 h-6 text-blue-600" />
        {t("overview")}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={`flex items-center justify-between rounded-xl shadow-md p-4 ${
              COLORS[i % COLORS.length]
            } transition hover:scale-105 duration-150`}
          >
            <div>
              <p className="text-sm font-medium">{m.label}</p>
              <p className="text-lg font-bold">{m.value}</p>
            </div>
            <m.icon className="w-6 h-6 opacity-80" />
          </div>
        ))}
      </div>
    </div>
  );
}
