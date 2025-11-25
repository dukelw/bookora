"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle, FaTruck, FaClock } from "react-icons/fa";
import { useTranslations } from "use-intl";

interface OrderStatusHistoryItem {
  status: string;
  updatedAt: string;
  _id: string;
}

interface OrderStatusTimelineProps {
  statusHistory: OrderStatusHistoryItem[];
}

const STATUS_ICON_MAP: any = {
  pending: <FaClock className="text-yellow-500 w-4 h-4" />,
  shipped: <FaTruck className="text-blue-500 w-4 h-4" />,
  completed: <FaCheckCircle className="text-green-500 w-4 h-4" />,
  cancelled: <FaTimesCircle className="text-red-500 w-4 h-4" />,
};

const STATUS_COLOR_MAP: Record<string, string> = {
  pending: "bg-yellow-500",
  shipped: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const OrderStatusTimeline: FC<OrderStatusTimelineProps> = ({
  statusHistory,
}) => {
  const t = useTranslations("order");
    const reversedHistory = [...(statusHistory || [])].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );


  return (
    <div className="relative pl-6 border-l border-gray-600">
      {reversedHistory?.map((item, idx) => (
        <motion.div
          key={item._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="mb-6 last:mb-0 group relative"
        >
          {/* Icon vòng tròn nổi */}
          <div className="absolute -left-3 top-0 flex items-center justify-center w-7 h-7 rounded-full border-2 border-gray-500 bg-gray-900 shadow-md group-hover:scale-110 transition-transform">
            {STATUS_ICON_MAP[item.status] || (
              <FaClock className="text-gray-400" />
            )}
          </div>

          {/* Nội dung trạng thái */}
          <div className="pl-6">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              {t(`${item.status}`)}
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  STATUS_COLOR_MAP[item.status]
                }`}
              />
            </p>
            <p className="text-xs text-gray-400">
              {new Date(item.updatedAt).toLocaleString("vi-VN", {
                hour12: false,
              })}
            </p>
          </div>

          {/* Line nối giữa các trạng thái */}
          {idx < statusHistory.length - 1 && (
            <div className="absolute left-0 top-7 w-0.5 h-full bg-gradient-to-b from-gray-500 via-gray-400 to-gray-500" />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default OrderStatusTimeline;
