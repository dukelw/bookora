"use client";
import { useState, useEffect } from "react";
import { discountService } from "@/services/discountService";
import { toast } from "react-toastify";

interface VoucherListProps {
  subtotal: number;
  appliedDiscount: any;
  setAppliedDiscount: (discount: any) => void;
  t: (key: string) => string;
}

export default function VoucherList({
  subtotal,
  appliedDiscount,
  setAppliedDiscount,
  t,
}: VoucherListProps) {
  const [discounts, setDiscounts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const res = await discountService.getAll();
        setDiscounts(res);
      } catch (err) {
        console.error(err);
        toast.error("Không thể lấy voucher");
      }
    };
    fetchDiscounts();
  }, []);

  return (
    <div className="mt-6 bg-neutral-900 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">{t("voucher")}</h3>
      <div className="space-y-2">
        {discounts.map((d) => (
          <div
            key={d._id}
            className={`flex justify-between items-center p-3 rounded-lg ${
              d.active ? "bg-neutral-800" : "bg-neutral-700"
            }`}
          >
            <span>{`${d.code} - ${
              d.type === "percentage" ? `${d.value}%` : `${d.value}đ`
            }`}</span>
            {d.active ? (
              <button
                className={`bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded text-sm ${
                  appliedDiscount?._id === d._id
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={appliedDiscount?._id === d._id}
                onClick={() => setAppliedDiscount(d)}
              >
                {t("apply")}
              </button>
            ) : (
              <span className="text-gray-400 text-sm">Không hoạt động</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
