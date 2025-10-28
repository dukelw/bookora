"use client";
import OrderTabs from "./components/OrderTabs";
import { useTranslations } from "use-intl";

export default function OrdersPage() {
  const t = useTranslations("order");
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-10 text-center text-white">
          {t("title")}
        </h1>

        <div className="bg-[#111] rounded-2xl shadow-md shadow-yellow-500/10 p-4 md:p-6 border border-gray-800">
          <OrderTabs />
        </div>
      </div>
    </div>
  );
}
