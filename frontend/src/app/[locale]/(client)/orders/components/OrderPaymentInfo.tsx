"use client";

import { OrderStatus } from "@/enums";
import React from "react";
import { useTranslations } from "use-intl";

interface PaymentInfoProps {
  payment: {
    paymentMethod: string;
    finalAmount: number;
    status: string;
  };
}

export default function OrderPaymentInfo({ payment }: PaymentInfoProps) {
  const t = useTranslations("order");
  if (!payment) return null;

  const formatPrice = (num: number) =>
    num.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  return (
    <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-4 text-gray-200 shadow-md hover:shadow-yellow-500/20 transition-all">
      <h3 className="text-lg font-semibold text-yellow-400 mb-2">
        {t("paymentInformation")}
      </h3>

      <div className="space-y-1 text-sm">
        <p>
          <strong className="text-gray-400">{t("method")}:</strong>{" "}
          {payment.paymentMethod === "vnpay"
            ? "VNPay"
            : payment.paymentMethod === "momo"
            ? "MoMo"
            : payment.paymentMethod === "cod"
            ? t("cod")
            : payment.paymentMethod}
        </p>

        <p>
          <strong className="text-gray-400">{t("total")}:</strong>{" "}
          <span className="text-yellow-400 font-semibold">
            {formatPrice(payment.finalAmount)}
          </span>
        </p>

        <p>
          <strong className="text-gray-400">{t("status")}:</strong>{" "}
          <span
            className={`font-semibold ${
              payment.status === OrderStatus.PENDING
                ? "text-yellow-400"
                : payment.status === OrderStatus.PAID
                ? "text-green-400"
                : payment.status === OrderStatus.SHIPPED
                ? "text-blue-400"
                : payment.status === OrderStatus.CANCELLED
                ? "text-red-400"
                : "text-gray-300"
            }`}
          >
            {payment.status === OrderStatus.PENDING
              ? t("pending")
              : payment.status === OrderStatus.PAID
              ? t("paid")
              : payment.status === OrderStatus.SHIPPED
              ? t("shipped")
              : payment.status === OrderStatus.CANCELLED
              ? t("cancelled")
              : payment.status}
          </span>
        </p>
      </div>
    </div>
  );
}
