"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import Link from "next/link";
import { Button } from "flowbite-react";
import { toast } from "react-toastify";
import { useCheckoutStore } from "@/store/checkoutStore";
import { orderService } from "@/services/orderService";
import { eventBus } from "@/utils/eventBus";
import { useTranslations } from "use-intl";

export default function ThankYou() {
  // const searchParams = useSearchParams();
  // const resultCode = searchParams.get("resultCode");
  const { checkout, setCheckout } = useCheckoutStore();
  const hasCreated = useRef(false); // 👈 flag để ngăn gọi 2 lần
  const t = useTranslations("payment");

  useEffect(() => {
    const handleCreateOrder = async () => {
      if (checkout && !hasCreated.current) {
        hasCreated.current = true; // ✅ đánh dấu đã gọi rồi
        try {
          const res = await orderService.createOrder(checkout);
          if (res) {
            toast.success(t("createOrderSuccessfully"));
            eventBus.emit("cart:refresh");
            setCheckout(null); // 👈 clear checkout sau khi tạo xong
          }
        } catch (err) {
          console.error(err);
          toast.error("Không thể tạo đơn hàng!");
          hasCreated.current = false; // Cho phép thử lại nếu cần
        }
      }
    };
    handleCreateOrder();
  }, [checkout]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white px-6 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-neutral-900 rounded-2xl p-8 shadow-lg text-center max-w-md w-full"
      >
        <FaCheckCircle className="text-green-400 text-6xl mb-4 mx-auto" />
        <h1 className="text-2xl font-bold mb-2">{t("orderSuccessfully")}</h1>
        <p className="text-gray-300 mb-6">{t("orderSuccessMessage")}</p>

        <Link href="/orders" className="w-full">
          <Button
            color="success"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all"
          >
            {t("followOrder")}
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
