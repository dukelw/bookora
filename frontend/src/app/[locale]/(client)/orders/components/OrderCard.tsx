"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Badge } from "flowbite-react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import OrderShippingInfo from "./OrderShippingInfo";
import OrderPaymentInfo from "./OrderPaymentInfo";
import { STATUS_MAP } from "@/constants";
import OrderItemsList from "./OrderItemsList";
import { orderService } from "@/services/orderService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useRatingStore } from "@/store/ratingStore";
import ConfirmModal from "@/components/modal/ConfirmModal";
import { useState } from "react";
import { eventBus } from "@/utils/eventBus";

export default function OrderCard({ order, expanded, onToggle }: any) {
  const router = useRouter();
  const { setCurrentBookToRate, setReviewRequest } = useRatingStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const res = await orderService.updateOrderStatus(order._id, "completed");
      if (res) {
        toast.success("Cập nhật trạng thái đơn hàng thành công!");
        setShowConfirm(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Cập nhật thất bại, thử lại sau!");
    }
  };

  const handleRateSingleItem = (item: any) => {
    const mainImage =
      item.book.images?.find((img: any) => img.isMain)?.url ||
      "/default-book.png";

    // Chỉ lấy variant đã mua
    const boughtVariant = item.book.variants?.find(
      (v: any) => v._id === item.variantId
    );
    const rateBook = {
      ...item.book,
      variant: boughtVariant,
      thumbnail: mainImage,
      bookId: item.book._id,
    };
    setCurrentBookToRate(rateBook);
    setReviewRequest(item.reviewRequestId);
    router.push(`/rating/${item.book.slug}`);
  };

  const handleConfirmClick = () => {
    setShowConfirm(false);
    eventBus.emit("orderUpdated");
  };

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
        <OrderItemsList items={order.items} onRate={handleRateSingleItem} />
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
              onClick={handleComplete}
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
        <ConfirmModal
          show={showConfirm}
          title="Đánh giá sản phẩm"
          message="Bạn có thể đánh giá sản phẩm khi vào mục Hoàn thành!"
          confirmText="Đã hiểu"
          cancelText="Thoát"
          onConfirm={handleConfirmClick}
          onCancel={() => setShowConfirm(false)}
        />
      </Card>
    </motion.div>
  );
}
