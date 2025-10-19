"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Badge } from "flowbite-react";
import Image from "next/image";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import OrderShippingInfo from "./OrderShippingInfo";
import OrderPaymentInfo from "./OrderPaymentInfo";
import { STATUS_MAP } from "@/constants";
import OrderItemsList from "./OrderItemsList";

export default function OrderCard({ order, expanded, onToggle }: any) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        onClick={onToggle}
        className={`cursor-pointer transition duration-300 border border-gray-700 bg-[#1a1a1a] hover:border-yellow-400 ${
          expanded ? "shadow-lg shadow-yellow-500/30" : ""
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <h5 className="text-lg font-semibold text-white">
            Đơn #{order._id.slice(-6)}
          </h5>
          <Badge
            color={
              STATUS_MAP[order.status as keyof typeof STATUS_MAP]?.color ||
              "gray"
            }
          >
            {STATUS_MAP[order.status as keyof typeof STATUS_MAP]?.icon}
            {STATUS_MAP[order.status as keyof typeof STATUS_MAP]?.label ||
              order.status}
          </Badge>
        </div>

        {/* --- Thông tin cơ bản --- */}
        <OrderItemsList items={order.items} />
        <p>
          <strong>Tổng tiền:</strong>{" "}
          <span className="text-yellow-400 font-semibold">
            {order.finalAmount?.toLocaleString("vi-VN")}₫
          </span>
        </p>
        <p>
          <strong>Ngày tạo:</strong>{" "}
          {new Date(order.createdAt).toLocaleString("vi-VN")}
        </p>

        {/* --- Nút hành động --- */}
        <div className="mt-3 flex justify-end gap-3">
          {order.status === "pending" && (
            <button
              onClick={(e) => e.stopPropagation()}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold 
                rounded-full flex items-center gap-2 shadow-[0_0_10px_rgba(255,0,0,0.5)] 
                hover:shadow-[0_0_15px_rgba(255,50,50,0.7)] transition-all"
            >
              <FaTimesCircle className="text-white" /> Hủy đơn
            </button>
          )}
          {order.status === "shipped" && (
            <button
              onClick={(e) => e.stopPropagation()}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold
                rounded-full flex items-center gap-2 
                shadow-[0_0_10px_rgba(0,128,0,0.5)] hover:shadow-[0_0_15px_rgba(0,200,0,0.7)]
                transition-all"
            >
              <FaCheckCircle className="text-white" /> Đã nhận hàng
            </button>
          )}
        </div>

        {/* --- Chi tiết mở rộng --- */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 border-t border-gray-600 pt-3 space-y-4"
            >
              <OrderShippingInfo shipping={order.shippingAddress} />
              <OrderPaymentInfo payment={order} />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
