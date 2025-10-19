"use client";

import React from "react";

interface PaymentInfoProps {
  payment: {
    paymentMethod: string;
    finalAmount: number;
    status: string;
  };
}

export default function OrderPaymentInfo({ payment }: PaymentInfoProps) {
  if (!payment) return null;

  const formatPrice = (num: number) =>
    num.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  return (
    <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-4 text-gray-200 shadow-md hover:shadow-yellow-500/20 transition-all">
      <h3 className="text-lg font-semibold text-yellow-400 mb-2">
        Thông tin thanh toán
      </h3>

      <div className="space-y-1 text-sm">
        <p>
          <strong className="text-gray-400">Phương thức:</strong>{" "}
          {payment.paymentMethod === "vnpay"
            ? "VNPay"
            : payment.paymentMethod === "momo"
            ? "MoMo"
            : payment.paymentMethod === "cod"
            ? "Thanh toán khi nhận hàng"
            : payment.paymentMethod}
        </p>

        <p>
          <strong className="text-gray-400">Tổng tiền:</strong>{" "}
          <span className="text-yellow-400 font-semibold">
            {formatPrice(payment.finalAmount)}
          </span>
        </p>

        <p>
          <strong className="text-gray-400">Trạng thái:</strong>{" "}
          <span
            className={`font-semibold ${
              payment.status === "pending"
                ? "text-yellow-400"
                : payment.status === "paid"
                ? "text-green-400"
                : payment.status === "shipped"
                ? "text-blue-400"
                : payment.status === "cancelled"
                ? "text-red-400"
                : "text-gray-300"
            }`}
          >
            {payment.status === "pending"
              ? "Đang xử lý"
              : payment.status === "paid"
              ? "Đã thanh toán"
              : payment.status === "shipped"
              ? "Đã giao hàng"
              : payment.status === "cancelled"
              ? "Đã hủy"
              : payment.status}
          </span>
        </p>
      </div>
    </div>
  );
}
