"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import { useTranslations } from "use-intl";

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800 px-6 text-center">
      {/* Icon + tiêu đề */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <BarChart3 className="w-10 h-10 text-green-600" />
        <h1 className="text-4xl font-extrabold text-green-700">
          {t("title", { defaultValue: "Dashboard" })}
        </h1>
      </div>

      {/* Phần mô tả */}
      <p className="text-lg sm:text-xl text-gray-600 max-w-2xl leading-relaxed">
        {t("subtitle", {
          defaultValue:
            "Welcome to the admin dashboard, from here you can manage the entire bookstore.",
        })}
      </p>
    </div>
  );
}
