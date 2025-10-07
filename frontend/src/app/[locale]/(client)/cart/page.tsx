"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cartService } from "@/services/cartService";
import { useAuthStore } from "@/store/authStore";
import { Cart } from "@/interfaces/Cart";
import { formatCurrency } from "@/utils/format";
import { useCartStore } from "@/store/cartStore";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import { PAYMENT_OPTIONS } from "@/constants";
import { useTranslations } from "use-intl";
import { discountService } from "@/services/discountService";

export default function CheckoutPage() {
  const c = useTranslations("cart");
  const { user } = useAuthStore();
  const [cart, setCart] = useState<Cart | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>(
    cart?.items.map((item) => item._id) || [] // mặc định chọn hết
  );
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    note: "",
    otherReceiver: false,
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const handleRemoveItem = async (bookId: string, variantId: string) => {
    try {
      await cartService.removeItem(user._id, bookId, variantId);
      const updatedCart = await cartService.getCart(user._id);
      setCart(updatedCart);
      setCart(updatedCart); // cập nhật state cục bộ
      toast.success(c("removeSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(c("removeError"));
    }
  };

  useEffect(() => {
    const fetchCart = async () => {
      if (!user?._id) return;
      const response = await cartService.getCart(user._id);
      setCart(response);
    };
    fetchCart();
  }, [user]);

  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedItems.length === cart?.items.length) {
      setSelectedItems([]); // bỏ chọn hết
    } else {
      setSelectedItems(cart?.items.map((item) => item._id) || []);
    }
  };

  const handleAdjustQuantity = async (
    bookId: string,
    variantId: string,
    action: "increment" | "decrement"
  ) => {
    try {
      await cartService.adjustItem({
        userId: user._id,
        bookId,
        variantId,
        action,
      });
      const updatedCart = await cartService.getCart(user._id);
      setCart(updatedCart);
    } catch (err) {
      console.error(err);
      toast.error(c("updateError"));
    }
  };

  const subtotal =
    cart?.items.reduce((sum, item) => {
      if (!selectedItems.includes(item._id)) return sum;
      const variant = item.book.variants?.find((v) => v._id === item.variantId);
      return sum + (variant?.price || 0) * item.quantity;
    }, 0) || 0;

  const shippingFee = 0;
  const discount = 76000; // giả lập
  const total = subtotal - discount;

  return (
    <div className="bg-neutral-950 text-white min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Form thông tin vận chuyển */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {c("shippingInformation")}
          </h2>
          <form className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder={c("placeholderName")}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 flex-1"
              />
              <input
                type="text"
                placeholder={c("placeholderPhone")}
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 flex-1"
              />
            </div>
            <input
              type="email"
              placeholder={c("placeholderEmail")}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 w-full"
            />
            <input
              type="text"
              placeholder={c("placeholderAddress")}
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 w-full"
            />
            <input
              type="text"
              placeholder={c("placeholderCity")}
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 w-full"
            />
            <textarea
              placeholder={c("placeholderNote")}
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 w-full"
              rows={3}
            ></textarea>
          </form>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">{c("paymentMethod")}</h3>
            <div className="space-y-3">
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
                    <Image
                      src={opt.icon}
                      alt={opt.label}
                      width={40}
                      height={40}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Giỏ hàng + Thanh toán */}
        <div>
          <h2 className="text-2xl font-bold mb-6">{c("title")}</h2>

          {/* nút chọn tất cả */}
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={selectedItems.length === cart?.items.length}
              onChange={toggleAll}
            />
            <span>{c("selectAll")}</span>
          </div>

          {/* danh sách sản phẩm */}
          {cart?.items.map((item) => {
            const variant = item.book.variants?.find(
              (v) => v._id === item.variantId
            );
            return (
              <div
                key={item._id}
                className="flex items-center gap-4 bg-neutral-900 p-4 rounded-lg"
              >
                {/* checkbox cho từng item */}
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item._id)}
                  onChange={() => toggleItem(item._id)}
                />

                <div className="w-20 h-20 relative">
                  <Image
                    src={
                      variant?.image ||
                      item.book.images?.[0]?.url ||
                      "/placeholder.png"
                    }
                    alt={item.book.title}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>

                <div className="flex-1">
                  <p className="font-medium">{item.book.title}</p>
                  <p className="text-sm text-gray-400">{variant?.rarity}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleAdjustQuantity(
                          item.book._id,
                          item.variantId,
                          "decrement"
                        )
                      }
                      className="px-2 py-1 bg-neutral-800 rounded hover:bg-neutral-700"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleAdjustQuantity(
                          item.book._id,
                          item.variantId,
                          "increment"
                        )
                      }
                      className="px-2 py-1 bg-neutral-800 rounded hover:bg-neutral-700"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="font-semibold">
                  {formatCurrency((variant?.price || 0) * item.quantity)}
                </div>
                <button
                  onClick={() =>
                    handleRemoveItem(item.book._id, item.variantId)
                  }
                  className="ml-4 text-gray-500 hover:text-red-500 transition"
                >
                  <FaTrash />
                </button>
              </div>
            );
          })}
          {/* Voucher mock */}
          <div className="mt-6 bg-neutral-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">{c("voucher")}</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-neutral-800 p-3 rounded-lg">
                <span>Giảm 20k cho đơn từ 200k</span>
                <button className="bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded text-sm">
                  {c("apply")}
                </button>
              </div>
              <div className="flex justify-between items-center bg-neutral-800 p-3 rounded-lg">
                <span>Freeship cho đơn từ 150k</span>
                <button className="bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded text-sm">
                  {c("apply")}
                </button>
              </div>
            </div>
          </div>

          {/* Chi tiết thanh toán */}
          <div className="mt-8 bg-neutral-900 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              {c("paymentDetails")}
            </h3>
            <div className="flex justify-between text-sm mb-2">
              <span>{c("subtotal")}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>{c("shipping")}</span>
              <span>Miễn phí</span>
            </div>
            <div className="flex justify-between text-sm text-red-400 mb-2">
              <span>{c("discount")}</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>{c("grandTotal")}</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            className="mt-6 w-full bg-cyan-600 hover:bg-cyan-700 py-3 rounded-lg font-semibold"
            onClick={() => {
              console.log("Form data:", formData);
              console.log("Selected items:", selectedItems);
              console.log("Payment method:", paymentMethod);
              console.log("Total:", total);
            }}
          >
            {c("placeOrder")}
          </button>
        </div>
      </div>
    </div>
  );
}
