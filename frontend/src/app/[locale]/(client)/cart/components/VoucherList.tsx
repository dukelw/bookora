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
        setDiscounts(res.discounts);
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
        {discounts
          ?.filter((d) => d.active && d.usedCount < d.usageLimit) // 🔥 lọc trước khi render
          .map((d) => (
            <div
              key={d._id}
              className="flex justify-between items-center p-3 rounded-lg bg-neutral-800"
            >
              <span>{`${d.code} - ${
                d.type === "percentage" ? `${d.value}%` : `${d.value}đ`
              }`}</span>

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
            </div>
          ))}

        {/* Nếu không còn voucher hợp lệ */}
        {discounts?.filter((d) => d.active && d.usedCount < d.usageLimit)
          .length === 0 && (
          <p className="text-gray-400 italic">
            {t("noValidVoucher") || "Không có voucher khả dụng"}
          </p>
        )}
      </div>
    </div>
  );
}
