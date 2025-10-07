"use client";
import { formatCurrency } from "@/utils/format";

interface CartSummaryProps {
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  onSubmit: () => void;
  t: (key: string) => string;
}

export default function CartSummary({
  subtotal,
  shippingFee,
  discount,
  total,
  onSubmit,
  t,
}: CartSummaryProps) {
  return (
    <div className="mt-8 bg-neutral-900 p-4 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">{t("paymentDetails")}</h3>
      <div className="flex justify-between text-sm mb-2">
        <span>{t("subtotal")}</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span>{t("shipping")}</span>
        <span>
          {shippingFee === 0 ? "Miễn phí" : formatCurrency(shippingFee)}
        </span>
      </div>
      <div className="flex justify-between text-sm text-red-400 mb-2">
        <span>{t("discount")}</span>
        <span>-{formatCurrency(discount)}</span>
      </div>
      <div className="flex justify-between font-bold text-lg">
        <span>{t("grandTotal")}</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <button
        className="mt-6 w-full bg-cyan-600 hover:bg-cyan-700 py-3 rounded-lg font-semibold"
        onClick={onSubmit}
      >
        {t("placeOrder")}
      </button>
    </div>
  );
}
