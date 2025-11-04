"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { Button } from "flowbite-react";
import { toast } from "react-toastify";
import { useCheckoutStore } from "@/store/checkoutStore";
import { orderService } from "@/services/orderService";
import { mailService } from "@/services/mailService";
import { eventBus } from "@/utils/eventBus";
import { formatCurrency } from "@/utils/format";
import { useTranslations } from "use-intl";

export default function ThankYou() {
  const { checkout, setCheckout } = useCheckoutStore();
  const hasCreated = useRef(false);
  const t = useTranslations("payment");

  useEffect(() => {
    const handleCreateOrder = async () => {
      if (checkout && !hasCreated.current) {
        hasCreated.current = true;
        try {
          const res = await orderService.createOrder(checkout);

          if (res) {
            toast.success(t("createOrderSuccessfully"));
            eventBus.emit("cart:refresh");

            await mailService.sendMail({
              to: checkout.shippingAddress.email,
              subject: "Xác nhận đơn hàng của bạn",
              name: checkout.shippingAddress.name,
              content: `
                <h3>Xin chào ${checkout.shippingAddress.name},</h3>
                <p>Cảm ơn bạn đã đặt hàng! Đơn hàng của bạn đã được tiếp nhận.</p>
                <p><b>Tổng tiền:</b> ${formatCurrency(checkout.finalAmount)}</p>
                <p><b>Phương thức thanh toán:</b> ${checkout.paymentMethod}</p>
                <p><b>Địa chỉ nhận hàng:</b> ${
                  checkout.shippingAddress.address
                }</p>
                <p>Chúng tôi sẽ sớm liên hệ và giao hàng trong thời gian sớm nhất.</p>
                <p>Trân trọng,<br/>Đội ngũ cửa hàng</p>
              `,
            });

            // setCheckout(null);
          }
        } catch (err) {
          console.error(err);
          toast.error("Không thể tạo đơn hàng!");
          hasCreated.current = false;
        }
      }
    };
    handleCreateOrder();
  }, [checkout, t, setCheckout]);

  if (!checkout)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-neutral-950">
        <h2 className="text-xl">{t("noOrderInfo")}</h2>
        <Link href="/" className="text-green-400 underline mt-2">
          {t("goToHomePage")}
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-neutral-900 rounded-2xl shadow-lg p-6 md:p-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <FaCheckCircle className="text-green-400 text-6xl mb-4 mx-auto" />
          <h1 className="text-3xl font-bold mb-2">{t("orderSuccessfully")}</h1>
          <p className="text-gray-400">{t("orderSuccessMessage")}</p>
        </div>

        {/* Order info */}
        <h2 className="text-xl font-semibold mb-4 text-center border-b border-gray-700 pb-2">
          {t("orderInformation")}
        </h2>

        <table className="w-full text-sm md:text-base mb-6">
          <thead className="text-gray-400 border-b border-gray-700">
            <tr>
              <th className="text-left py-2">{t("productName")}</th>
              <th className="text-center">{t("quantity")}</th>
              <th className="text-center">{t("price")}</th>
              <th className="text-center">{t("total")}</th>
            </tr>
          </thead>

          <tbody>
            {checkout.items.map((item: any, index: number) => {
              const book = item.bookDetail;
              const variant = item.variant;
              const image =
                variant?.image ||
                book?.images?.find((img: any) => img.isMain)?.url ||
                book?.images?.[0]?.url ||
                "/images/fallback/default-book.png";

              return (
                <tr key={index} className="border-b border-gray-800">
                  <td className="flex items-center gap-3 py-3">
                    <img
                      src={image}
                      alt={book?.title || "Book image"}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{book?.title}</span>
                      <span className="text-gray-400 text-xs">
                        {variant?.rarity || t("normalVersion")}
                      </span>
                    </div>
                  </td>

                  <td className="text-center">{item.quantity}</td>
                  <td className="text-center">{formatCurrency(item.price)}</td>
                  <td className="text-center">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Total section */}
        <div className="border-t border-gray-700 pt-4 space-y-1 text-right">
          <p>
            <span className="text-gray-400 mr-2">{t("totalValue")}:</span>
            {formatCurrency(checkout.totalAmount)}
          </p>
          <p>
            <span className="text-gray-400 mr-2">{t("discount")}:</span>-
            {formatCurrency(checkout.discountAmount || 0)}
          </p>
          <p>
            <span className="text-gray-400 mr-2">{t("loyaltyPointUse")}:</span>-
            {formatCurrency(checkout.loyaltyDiscountAmount || 0)}
          </p>
          <p>
            <span className="text-gray-400 mr-2">{t("feeShip")}:</span>
            {formatCurrency(checkout.shippingFee || 0)}
          </p>
          <p className="text-xl font-bold mt-2">
            {t("total")}:{" "}
            <span className="text-green-400">
              {formatCurrency(checkout.finalAmount)}
            </span>
          </p>
        </div>

        {/* Shipping info */}
        <h2 className="text-xl font-semibold mt-10 mb-4 text-center border-b border-gray-700 pb-2">
          {t("receiverInformation")}
        </h2>
        <div className="space-y-2 text-gray-300">
          <p>
            <b>{t("name")}:</b> {checkout.shippingAddress.name}
          </p>
          <p>
            <b>{t("email")}:</b> {checkout.shippingAddress.email}
          </p>
          <p>
            <b>{t("phoneNumber")}:</b> {checkout.shippingAddress.phone}
          </p>
          <p>
            <b>{t("paymentMethod")}:</b> {checkout.paymentMethod.toUpperCase()}
          </p>
          <p>
            <b>{t("shippingAddress")}:</b> {checkout.shippingAddress.address}
          </p>
          {checkout.shippingAddress.note && (
            <p>
              <b>{t("note")}:</b> {checkout.shippingAddress.note}
            </p>
          )}
        </div>

        {/* Back / follow order button */}
        <div className="mt-10 text-center">
          <Link href="/orders">
            <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl px-8 transition-all">
              {t("followOrder")}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
