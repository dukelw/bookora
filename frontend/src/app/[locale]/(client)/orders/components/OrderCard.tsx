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
import { useTranslations } from "use-intl";
import { OrderStatus } from "@/enums";
import OrderStatusTimeline from "./OrderStatusTimeline";

export default function OrderCard({ order, expanded, onToggle }: any) {
  const t = useTranslations("order");
  const router = useRouter();
  const { setCurrentBookToRate, setReviewRequest } = useRatingStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const res = await orderService.updateOrderStatus(
        order._id,
        OrderStatus.COMPLETED
      );
      if (res) {
        toast.success(t("updateOrderStatusSuccessfully"));
        setShowConfirm(true);
      }
    } catch (err: any) {
      toast.error(err.message || t("updateOrderStatusFailed"));
    }
  };

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const res = await orderService.updateOrderStatus(
        order._id,
        OrderStatus.CANCELLED
      );
      if (res) {
        toast.success(t("updateOrderStatusSuccessfully"));
      }
    } catch (err: any) {
      toast.error(err.message || t("updateOrderStatusFailed"));
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
            {t("order")} #{order._id.slice(-6)}
          </h5>
          <Badge
            color={
              STATUS_MAP[order.status as keyof typeof STATUS_MAP]?.color ||
              "gray"
            }
          >
            {STATUS_MAP[order.status as keyof typeof STATUS_MAP]?.icon}
            {t(
              `${STATUS_MAP[order.status as keyof typeof STATUS_MAP]?.label}`
            ) || t(`${order.status}`)}
          </Badge>
        </div>

        {/* --- Thông tin cơ bản --- */}
        <OrderItemsList
          items={order.items}
          onRate={handleRateSingleItem}
          showAll={expanded} // <-- pass expanded so it shows all when expanded
        />
        <p>
          <strong>{t("total")}:</strong>{" "}
          <span className="text-yellow-400 font-semibold">
            {order.finalAmount?.toLocaleString("vi-VN")}₫
          </span>
        </p>
        <p>
          <strong>{t("createdAt")}:</strong>{" "}
          {new Date(order.createdAt).toLocaleString("vi-VN")}
        </p>

        {/* --- Nút hành động --- */}
        <div className="mt-3 flex justify-end gap-3">
          {order.status === OrderStatus.PENDING && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold 
                rounded-full flex items-center gap-2 shadow-[0_0_10px_rgba(255,0,0,0.5)] 
                hover:shadow-[0_0_15px_rgba(255,50,50,0.7)] transition-all"
            >
              <FaTimesCircle className="text-white" /> {t("cancel")}
            </button>
          )}
          {order.status === OrderStatus.SHIPPED && (
            <button
              onClick={handleComplete}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold
                rounded-full flex items-center gap-2 
                shadow-[0_0_10px_rgba(0,128,0,0.5)] hover:shadow-[0_0_15px_rgba(0,200,0,0.7)]
                transition-all"
            >
              <FaCheckCircle className="text-white" /> {t("received")}
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
              {/* Timeline trạng thái */}
              <div>
                <h6 className="text-white font-semibold mb-2">
                  {t("statusHistory")}
                </h6>
                <OrderStatusTimeline
                  statusHistory={order.statusHistory || []}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <ConfirmModal
          show={showConfirm}
          title={t("rateTheBook")}
          message={t("youCanRateTheBookInCompletedTab")}
          confirmText={t("understood")}
          cancelText={t("cancel")}
          onConfirm={handleConfirmClick}
          onCancel={() => setShowConfirm(false)}
        />
      </Card>
    </motion.div>
  );
}
