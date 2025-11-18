"use client";
import { useEffect, useMemo } from "react";
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
  t: (key: string, values?: Record<string, any>) => string;
}

export default function CartItemList({
  cart,
  selectedItems,
  setSelectedItems,
  setCart,
  userId,
  t,
}: CartItemListProps) {
  // Các item đủ điều kiện chọn (quantity <= stock và stock > 0)
  const eligibleIds = useMemo(() => {
    if (!cart?.items?.length) return [];
    return cart.items
      .filter((item: any) => {
        const variant = item.book?.variants?.find(
          (v: any) => v._id === item.variantId
        );
        const stock = variant?.stock ?? 0;
        return stock > 0 && item.quantity <= stock;
      })
      .map((item: any) => item._id);
  }, [cart]);

  // Đồng bộ selectedItems với tồn kho mỗi khi cart thay đổi (kể cả lần đầu)
  useEffect(() => {
    if (!cart?.items?.length) return;
    setSelectedItems((prev) => prev.filter((id) => eligibleIds.includes(id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, eligibleIds.length]);

  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (!cart?.items?.length) return;
    const allSelected =
      eligibleIds.length > 0 && selectedItems.length === eligibleIds.length;
    setSelectedItems(allSelected ? [] : eligibleIds);
  };

  const afterCartUpdateSyncSelection = (updatedCart: any) => {
    setSelectedItems((prev) =>
      prev.filter((id) => {
        const item = updatedCart.items?.find((x: any) => x._id === id);
        if (!item) return false;
        const variant = item.book?.variants?.find(
          (v: any) => v._id === item.variantId
        );
        const stock = variant?.stock ?? 0;
        return stock > 0 && item.quantity <= stock;
      })
    );
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
      afterCartUpdateSyncSelection(updatedCart);
    } catch {
      toast.error(t("updateError") || "Cập nhật giỏ hàng thất bại");
    }
  };

  const handleRemoveItem = async (bookId: string, variantId: string) => {
    try {
      await cartService.removeItem(userId, bookId, variantId);
      const updatedCart = await cartService.getCart(userId);
      setCart(updatedCart);
      afterCartUpdateSyncSelection(updatedCart);
      toast.success(t("removeSuccess") || "Đã xóa sản phẩm khỏi giỏ");
    } catch {
      toast.error(t("removeError") || "Xóa sản phẩm thất bại");
    }
  };

  const isAllEligibleSelected =
    eligibleIds.length > 0 && selectedItems.length === eligibleIds.length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          checked={isAllEligibleSelected}
          onChange={toggleAll}
        />
        <span>{t("selectAll")}</span>
      </div>

      {cart?.items.map((item: any) => {
        const variant = item.book.variants?.find(
          (v: any) => v._id === item.variantId
        );
        const stock = variant?.stock ?? 0;

        const canSelect = stock > 0 && item.quantity <= stock;
        const canIncrement = item.quantity < stock;
        const canDecrement = item.quantity > 1;

        const isSelected = canSelect && selectedItems.includes(item._id);

        return (
          <div
            key={item._id}
            className="flex items-center gap-4 bg-neutral-900 p-4 rounded-lg mb-2"
          >
            <input
              type="checkbox"
              disabled={!canSelect}
              checked={isSelected}
              onChange={() => {
                if (!canSelect) {
                  toast.warning(t("insufficientStock", { stock }));
                  return;
                }
                toggleItem(item._id);
              }}
              title={!canSelect ? t("insufficientStock", { stock }) : ""}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
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

              <div className="text-xs mt-1">
                {stock <= 0 ? (
                  <span className="text-red-400">
                    {t("outOfStock") || "Hết hàng"}
                  </span>
                ) : item.quantity > stock ? (
                  <span className="text-yellow-400">
                    {t("insufficientStock", { stock })}
                  </span>
                ) : (
                  <span className="text-gray-400">
                    {t("inStock") || "Tồn kho"}: {stock}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() =>
                    canDecrement
                      ? handleAdjustQuantity(
                          item.book._id,
                          item.variantId,
                          "decrement"
                        )
                      : undefined
                  }
                  className="px-2 py-1 bg-neutral-800 rounded hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!canDecrement}
                  title={
                    !canDecrement
                      ? t("minQuantity") || "Số lượng tối thiểu là 1"
                      : ""
                  }
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => {
                    if (!canIncrement) {
                      toast.info(
                        t("maxStockReached") ||
                          "Đã đạt số lượng tối đa theo tồn kho"
                      );
                      return;
                    }
                    handleAdjustQuantity(
                      item.book._id,
                      item.variantId,
                      "increment"
                    );
                  }}
                  className="px-2 py-1 bg-neutral-800 rounded hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!canIncrement}
                  title={
                    !canIncrement
                      ? t("maxStockReached") ||
                        "Đã đạt số lượng tối đa theo tồn kho"
                      : ""
                  }
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
