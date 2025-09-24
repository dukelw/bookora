"use client";

import Image from "next/image";
import Link from "next/link";
import { Popover, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef } from "react";
import { FaTrash } from "react-icons/fa";
import { formatCurrency } from "@/utils/format";
import { Cart } from "@/interfaces/Cart";
import { cartService } from "@/services/cartService";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import { useCartStore } from "@/store/cartStore";

interface CartDropdownProps {
  cart: Cart | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDropdown({
  cart,
  isOpen,
  onClose,
}: CartDropdownProps) {
  const items = cart?.items || [];
  const panelRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { setCart } = useCartStore();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const handleRemoveItem = async (bookId: string, variantId: string) => {
    try {
      await cartService.removeItem(user._id, bookId, variantId);
      const updatedCart = await cartService.getCart(user._id);
      setCart(updatedCart);
      toast.success("Đã xoá sản phẩm khỏi giỏ hàng");
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi khi xoá sản phẩm");
    }
  };

  if (!isOpen) return null;

  return (
    <Popover className="relative">
      <Transition
        as={Fragment}
        show={isOpen}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel
          ref={panelRef}
          static
          className="absolute right-0 mt-2 w-96 bg-neutral-900 text-white rounded-xl shadow-lg z-50"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Giỏ hàng</h3>
              <Link
                href="/cart"
                className="text-sm text-cyan-400 hover:underline"
                onClick={onClose}
              >
                Xem tất cả
              </Link>
            </div>

            {items.length === 0 && (
              <p className="text-gray-400 text-sm">Giỏ hàng của bạn trống</p>
            )}

            <div className="space-y-3">
              {items.slice(0, 5).map((item) => {
                const variant =
                  item?.book?.variants?.find((v) => v._id === item.variantId) ||
                  null;

                return (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 rounded-lg hover:bg-neutral-800 p-2 transition"
                  >
                    {/* ảnh */}
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                      <Image
                        src={
                          variant?.image ||
                          item?.book?.images?.[0]?.url ||
                          "/placeholder.png"
                        }
                        alt={item?.book?.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* thông tin */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate text-sm">
                        {item.book.title}
                      </p>
                      <p className="text-xs text-gray-400">{variant.rarity}</p>
                      <p className="text-xs text-gray-400">
                        SL: {item.quantity}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {formatCurrency(variant?.price || 0)}
                        </span>
                        {variant?.originalPrice &&
                          variant.originalPrice > variant.price && (
                            <>
                              <span className="text-xs line-through text-gray-500">
                                {formatCurrency(variant.originalPrice)}
                              </span>
                              <span className="text-xs text-red-400 font-medium">
                                -
                                {Math.round(
                                  (1 - variant.price / variant.originalPrice) *
                                    100
                                )}
                                %
                              </span>
                            </>
                          )}
                      </div>
                    </div>

                    {/* nút xoá */}
                    <button
                      onClick={() =>
                        handleRemoveItem(item.book._id, item.variantId)
                      }
                      className="text-gray-500 hover:text-red-500 transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* footer */}
          <div className="p-4 bg-neutral-800 rounded-b-xl">
            <Link
              href="/cart"
              className="block w-full text-center bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 transition"
              onClick={onClose}
            >
              Đi đến giỏ hàng
            </Link>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
