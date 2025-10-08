"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import Link from "next/link";
import { Button } from "flowbite-react";
import { toast } from "react-toastify";
import { useCheckoutStore } from "@/store/checkoutStore";
import { orderService } from "@/services/orderService";
import { eventBus } from "@/utils/eventBus";

export default function ThankYou() {
  // const searchParams = useSearchParams();
  // const resultCode = searchParams.get("resultCode");
  const { checkout } = useCheckoutStore();

  useEffect(() => {
    const handleCreateOrder = async () => {
      if (checkout) {
        // if (resultCode === "0" && checkout) {
        try {
          const res = await orderService.createOrder(checkout);
          if (res) {
            toast.success("Tạo đơn hàng thành công!");
            setTimeout(() => {
              eventBus.emit("cart:refresh");
            }, 1000);
          }
        } catch (err) {
          console.error(err);
          toast.error("Không thể tạo đơn hàng!");
        }
      }
    };

    handleCreateOrder();
    // }, [resultCode, checkout]);
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
        <h1 className="text-2xl font-bold mb-2">Mua hàng thành công!</h1>
        <p className="text-gray-300 mb-6">
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý, vui lòng
          theo dõi trạng thái để biết thêm chi tiết.
        </p>

        <Link href="/orders" className="w-full">
          <Button
            color="success"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all"
          >
            Theo dõi đơn hàng
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
