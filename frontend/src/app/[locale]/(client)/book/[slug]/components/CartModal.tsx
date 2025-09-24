"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { FaShoppingCart } from "react-icons/fa";
import Image from "next/image";
import { BookVariant } from "@/interfaces/Book";

type Props = {
  bookId: string;
  isOpen: boolean;
  onClose: () => void;
  variants: BookVariant[];
  onConfirm: (items: { variant: BookVariant; quantity: number }[]) => void;
};

export default function CartModal({
  bookId,
  isOpen,
  onClose,
  variants,
  onConfirm,
}: Props) {
  const [selected, setSelected] = useState<
    Record<string, { variant: BookVariant; quantity: number }>
  >({});

  const toggleVariant = (variant: BookVariant) => {
    setSelected((prev) => {
      const newSelected = { ...prev };
      if (newSelected[variant._id]) {
        delete newSelected[variant._id];
      } else {
        newSelected[variant._id] = { variant, quantity: 1 };
      }
      return newSelected;
    });
  };

  const updateQuantity = (variantId: string, delta: number, stock: number) => {
    setSelected((prev) => {
      if (!prev[variantId]) return prev;
      const newSelected = { ...prev };
      const currentQty = newSelected[variantId].quantity;
      const newQty = Math.min(stock, Math.max(1, currentQty + delta));
      newSelected[variantId] = {
        ...newSelected[variantId],
        quantity: newQty,
      };
      return newSelected;
    });
  };

  const handleConfirm = () => {
    const items = Object.values(selected);
    if (items.length > 0) onConfirm(items);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setSelected({});
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* overlay */}
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-md w-full p-5 space-y-5">
          {/* title */}
          <Dialog.Title className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaShoppingCart className="text-cyan-600" /> Thêm vào giỏ
          </Dialog.Title>

          {/* danh sách variant */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {variants.map((v) => {
              const isSelected = !!selected[v._id];
              return (
                <div
                  key={v._id}
                  className={`flex items-center gap-3 rounded-xl p-3 border cursor-pointer transition ${
                    isSelected
                      ? "border-cyan-600 bg-cyan-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => toggleVariant(v)}
                >
                  {/* ảnh */}
                  <Image
                    src={v.image || "/images/logo/logo.png"}
                    alt={v.rarity}
                    width={60}
                    height={60}
                    className="rounded-md object-cover aspect-square w-14 h-14"
                  />

                  {/* info */}
                  <div className="flex-1">
                    <p className="font-semibold">{v.rarity}</p>
                    <p className="text-sm text-gray-500">
                      {v.price.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>

                  {/* qty control */}
                  {isSelected && (
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => updateQuantity(v._id, -1, v.stock)}
                        className="w-7 h-7 flex items-center justify-center rounded-full border text-gray-700 hover:bg-gray-100"
                      >
                        –
                      </button>
                      <span className="w-6 text-center font-semibold">
                        {selected[v._id]?.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(v._id, 1, v.stock)}
                        className="w-7 h-7 flex items-center justify-center rounded-full border text-gray-700 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* action */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-400 transition"
            >
              Hủy
            </button>
            <button
              disabled={Object.keys(selected).length === 0}
              onClick={handleConfirm}
              className="px-5 py-2 bg-cyan-600 text-white rounded-lg text-sm shadow hover:bg-cyan-700 disabled:opacity-50"
            >
              <FaShoppingCart className="inline mr-2" />
              Thêm ({Object.keys(selected).length})
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
