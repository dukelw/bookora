"use client";

import React from "react";
import { useTranslations } from "use-intl";

interface ShippingInfoProps {
  shipping: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    note?: string;
  };
}

export default function OrderShippingInfo({ shipping }: ShippingInfoProps) {
  const t = useTranslations("order");
  if (!shipping) return null;

  return (
    <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-4 text-gray-200 shadow-md hover:shadow-yellow-500/20 transition-all">
      <h3 className="text-lg font-semibold text-yellow-400 mb-2">
        {t("deliveryInformation")}
      </h3>
      <div className="space-y-1 text-sm">
        <p>
          <strong className="text-gray-400">{t("name")}:</strong>{" "}
          {shipping.name}
        </p>
        <p>
          <strong className="text-gray-400">{t("phone")}:</strong>{" "}
          {shipping.phone}
        </p>
        <p>
          <strong className="text-gray-400">{t("email")}:</strong> {shipping.email}
        </p>
        <p>
          <strong className="text-gray-400">{t("address")}:</strong> {shipping.address}
          , {shipping.city}
        </p>
        {shipping.note && (
          <p>
            <strong className="text-gray-400">{t("note")}:</strong> {shipping.note}
          </p>
        )}
      </div>
    </div>
  );
}
