"use client";
import Image from "next/image";
import { PAYMENT_OPTIONS } from "@/constants";

export default function PaymentMethod({
  paymentMethod,
  setPaymentMethod,
  t,
}: {
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">{t("paymentMethod")}</h3>
      <div className="space-y-3">
        {PAYMENT_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-3 p-3 bg-neutral-900 rounded-lg cursor-pointer"
          >
            <input
              type="radio"
              name="payment"
              value={opt.value}
              checked={paymentMethod === opt.value}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <Image src={opt.icon} alt={opt.label} width={40} height={40} />
            <span>{t(opt.label)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
