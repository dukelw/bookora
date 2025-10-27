"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Filter } from "lucide-react";
import { statisticService } from "@/services/statisticService";
import OverviewMetrics from "./components/OverviewMetrics";
import TopProducts from "./components/TopProducts";
import TimeSeriesChart from "./components/TimeSeriesChart";
import BreakdownChart from "./components/BreakdownChart";
import { Tabs, TabItem } from "flowbite-react";
import { useTranslations } from "use-intl";

// ✅ Tạo kiểu để TypeScript hiểu đúng
type Granularity = "year" | "quarter" | "month" | "week";
type ProfitMode = "none" | "variant" | "book";

export default function StatisticPage() {
  const [overview, setOverview] = useState<any>(null);
  const [timeSeries, setTimeSeries] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("dashboard.statistic");

  // 🧭 State filters có kiểu chính xác
  const [filters, setFilters] = useState<{
    from: string;
    to: string;
    granularity: Granularity;
    profitMode: ProfitMode;
  }>({
    from: "2025-01-01T00:00:00.000Z",
    to: "2025-12-31T23:59:59.000Z",
    granularity: "month",
    profitMode: "none",
  });

  async function fetchData() {
    setLoading(true);
    try {
      const [overviewData, timeData, breakdownData] = await Promise.all([
        statisticService.getOverview(filters),
        statisticService.getTimeSeries(filters),
        statisticService.getProductBreakdown(filters),
      ]);
      setOverview(overviewData);
      setTimeSeries(timeData);
      setBreakdown(breakdownData);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [filters]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-gray-500" size={40} />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* 🎛 Bộ lọc */}
      <div className="bg-white shadow rounded-2xl p-5 border border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">
          <Filter className="w-5 h-5 text-blue-600" />
          <span>{t("filters")}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* From */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              {t("from")}
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={filters.from.slice(0, 10)}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  from: new Date(e.target.value).toISOString(),
                }))
              }
            />
          </div>

          {/* To */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              {t("to")}
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={filters.to.slice(0, 10)}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  to: new Date(e.target.value).toISOString(),
                }))
              }
            />
          </div>

          {/* Granularity */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              {t("granularity")}
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={filters.granularity}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  granularity: e.target.value as Granularity,
                }))
              }
            >
              <option value="year">{t("year")}</option>
              <option value="quarter">{t("quarter")}</option>
              <option value="month">{t("month")}</option>
              <option value="week">{t("week")}</option>
            </select>
          </div>

          {/* Profit mode */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              {t("profitMode")}
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={filters.profitMode}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  profitMode: e.target.value as ProfitMode,
                }))
              }
            >
              <option value="none">{t("none")}</option>
              <option value="variant">{t("variant")}</option>
              <option value="book">{t("book")}</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-4 gap-3">
          <button
            onClick={() =>
              setFilters({
                from: "2025-01-01T00:00:00.000Z",
                to: "2025-12-31T23:59:59.000Z",
                granularity: "month",
                profitMode: "none",
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            {t("reset")}
          </button>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            {t("apply")}
          </button>
        </div>
      </div>

      {/* 📊 Tabs */}
      <Tabs aria-label="Dashboard Tabs">
        <TabItem active title={t("simpleDashboard")}>
          <OverviewMetrics totals={overview?.totals} range={overview?.range} />
          <TopProducts products={overview?.topProducts} />
        </TabItem>

        <TabItem title={t("advancedDashboard")}>
          <TimeSeriesChart data={timeSeries} />
          <BreakdownChart data={breakdown?.data} />
        </TabItem>
      </Tabs>
    </div>
  );
}
