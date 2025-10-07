"use client";
import { useEffect, useState } from "react";
import { paymentService } from "@/services/paymentService";
import { useCheckoutStore } from "@/store/checkoutStore";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaQrcode, FaMoneyBillWave } from "react-icons/fa";
import { Spinner } from "flowbite-react";
import { REDIRECT_URL } from "@/constants";

export default function Momo() {
  const { checkout } = useCheckoutStore();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (checkout) {
      handlePayWithMomo();
    }
  }, [checkout]);

  const handlePayWithMomo = async () => {
    try {
      setIsLoading(true);
      const res = await paymentService.payWithMomo(
        checkout.finalAmount,
        REDIRECT_URL
      );

      if (res?.data?.data?.qrCodeUrl && res?.data?.payUrl) {
        setQrCodeUrl(res.data.data.qrCodeUrl);
        setPayUrl(res.data.payUrl);
      } else {
        toast.error("Không thể tạo mã thanh toán MoMo!");
      }
    } catch (err) {
      toast.error("Lỗi khi tạo thanh toán MoMo!");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!checkout) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-neutral-950">
        <p>Không tìm thấy thông tin thanh toán.</p>
      </div>
    );
  }

  const { shippingAddress, items, finalAmount } = checkout;

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-white px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neutral-900 rounded-2xl p-8 shadow-lg max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Cột trái: Thông tin thanh toán */}
        <div className="space-y-6">
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaMoneyBillWave className="text-pink-500" />
            Thông tin thanh toán
          </h1>

          <div className="bg-neutral-800 rounded-xl p-4 space-y-3">
            <p>
              <span className="text-gray-400">Người nhận:</span>{" "}
              {shippingAddress?.name}
            </p>
            <p>
              <span className="text-gray-400">Số điện thoại:</span>{" "}
              {shippingAddress?.phone}
            </p>
            <p>
              <span className="text-gray-400">Địa chỉ:</span>{" "}
              {shippingAddress?.address}
            </p>
            <p>
              <span className="text-gray-400">Số lượng sách:</span>{" "}
              {items?.reduce((acc: number, i: any) => acc + i.quantity, 0)}
            </p>
            <p>
              <span className="text-gray-400">Tổng tiền:</span>{" "}
              <span className="text-pink-400 font-semibold">
                {finalAmount.toLocaleString("vi-VN")}₫
              </span>
            </p>
          </div>
        </div>

        {/* Cột phải: QR MoMo */}
        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold mb-4">Thanh toán qua MoMo</h2>

          {isLoading ? (
            <Spinner color="pink" size="xl" />
          ) : qrCodeUrl ? (
            <div className="flex flex-col items-center gap-6">
              <QRCodeCanvas value={qrCodeUrl} size={220} includeMargin={true} />
              <p className="text-gray-300 text-sm">
                Quét mã này bằng ứng dụng MoMo để thanh toán
              </p>

              <a
                href={payUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <FaQrcode />
                Mở trang thanh toán MoMo
              </a>
            </div>
          ) : (
            <p className="text-gray-400">Đang khởi tạo mã thanh toán...</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
