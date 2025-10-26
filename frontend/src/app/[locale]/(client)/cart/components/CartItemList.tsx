"use client";
import Image from "next/image";
import { FaTrash } from "react-icons/fa";
import { cartService } from "@/services/cartService";
import { toast } from "react-toastify";
import { formatCurrency } from "@/utils/format";

interface CartItemListProps {
  cart: any;
  selectedItems: string[];
  setSelectedItems: (ids: string[]) => void;
  setCart: (cart: any) => void;
  userId: string;
  t: (key: string) => string;
}

export default function CartItemList({
  cart,
  selectedItems,
  setSelectedItems,
  setCart,
  userId,
  t,
}: CartItemListProps) {
  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedItems.length === cart?.items.length) setSelectedItems([]);
    else setSelectedItems(cart?.items.map((item: any) => item._id) || []);
  };

  const handleAdjustQuantity = async (
    bookId: string,
    variantId: string,
    action: "increment" | "decrement"
  ) => {
    try {
      await cartService.adjustItem({ userId, bookId, variantId, action });
      const updatedCart = await cartService.getCart(userId);
      setCart(updatedCart);
    } catch {
      toast.error(t("updateError"));
    }
  };

  const handleRemoveItem = async (bookId: string, variantId: string) => {
    try {
      await cartService.removeItem(userId, bookId, variantId);
      const updatedCart = await cartService.getCart(userId);
      setCart(updatedCart);
      setSelectedItems((prev) =>
        prev.filter((id) =>
          updatedCart.items.some((item: any) => item._id === id)
        )
      );
      toast.success(t("removeSuccess"));
    } catch {
      toast.error(t("removeError"));
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          checked={selectedItems.length === cart?.items.length}
          onChange={toggleAll}
        />
        <span>{t("selectAll")}</span>
      </div>

      {cart?.items.map((item: any) => {
        const variant = item.book.variants?.find(
          (v: any) => v._id === item.variantId
        );
        return (
          <div
            key={item._id}
            className="flex items-center gap-4 bg-neutral-900 p-4 rounded-lg mb-2"
          >
            <input
              type="checkbox"
              checked={selectedItems.includes(item._id)}
              onChange={() => toggleItem(item._id)}
            />
            <div className="w-20 h-20 relative">
              <img
                src={
                  variant?.image ||
                  item.book.images?.[0]?.url ||
                  "/placeholder.png"
                }
                alt={item.book.title}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.book.title}</p>
              <p className="text-sm text-gray-400">{variant?.rarity}</p>
              <div className="flex items-center gap-2 mt-1">
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
              onClick={() => handleRemoveItem(item.book._id, item.variantId)}
              className="ml-4 text-gray-500 hover:text-red-500 transition"
            >
              <FaTrash />
            </button>
          </div>
        );
      })}
    </div>
  );
}
