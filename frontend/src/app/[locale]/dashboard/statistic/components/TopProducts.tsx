"use client";

import { Trophy, DollarSign, Package, Calendar, User } from "lucide-react";
import { useTranslations } from "use-intl";

export default function TopProducts({ products }: any) {
  const t = useTranslations("dashboard.statistic");
  if (!products || products.length === 0) return null;

  const RANK_STYLES = [
    {
      bg: "bg-gradient-to-r from-yellow-100 via-yellow-50 to-white border-yellow-400",
      text: "text-yellow-700",
      badge: "bg-yellow-500 text-white shadow-yellow-300",
    },
    {
      bg: "bg-gradient-to-r from-gray-100 via-gray-50 to-white border-gray-400",
      text: "text-gray-700",
      badge: "bg-gray-400 text-white shadow-gray-300",
    },
    {
      bg: "bg-gradient-to-r from-amber-100 via-amber-50 to-white border-amber-400",
      text: "text-amber-800",
      badge: "bg-amber-500 text-white shadow-amber-300",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-5 flex items-center gap-2 text-gray-800">
        <Trophy className="text-yellow-500 w-6 h-6" /> {t("topSellingProducts")}
      </h2>

      <div className="space-y-4">
        {products.map((p: any, idx: number) => {
          const rank = idx + 1;
          const style = RANK_STYLES[idx] || {
            bg: "bg-gradient-to-r from-white to-gray-50 border-gray-200",
            text: "text-gray-700",
            badge: "bg-gray-200 text-gray-700",
          };
          const book = p.book;
          const image = book?.images?.find((img: any) => img.isMain)?.url;

          return (
            <div
              key={p.bookId}
              className={`relative flex items-center gap-4 border rounded-2xl p-4 ${style.bg} hover:shadow-xl transition-all hover:scale-[1.01]`}
            >
              {/* Rank badge */}
              <div
                className={`absolute -top-3 -left-3 w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg ${style.badge} shadow-md`}
              >
                #{rank}
              </div>

              {/* Image */}
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0 shadow-sm">
                {image ? (
                  <img
                    src={image}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 w-full h-full flex items-center justify-center text-xs text-gray-400">
                    {t("noImg")}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate text-lg ${style.text}`}>
                  {book.title}
                </p>
                <div className="text-sm text-gray-600 mt-1 space-y-1">
                  <p className="flex items-center gap-1">
                    <User className="w-4 h-4" /> {book.author}
                  </p>
                  <p className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {book.releaseYear}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right min-w-[120px]">
                <p className="flex items-center justify-end gap-1 text-green-700 font-semibold text-base">
                  {p.revenue.toLocaleString("vi-VN")} ₫
                </p>
                <p className="flex items-center justify-end gap-1 text-gray-600 text-sm mt-1">
                  <Package className="w-4 h-4" /> {p.quantity} {t("sold")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
