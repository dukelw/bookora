"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function OrderItemsList({ items, onRate }: any) {
  const router = useRouter();

  return (
    <div className="text-sm text-gray-300 space-y-2">
      {items.slice(0, 2).map((item: any, idx: number) => {
        const variant = item.book?.variants?.find(
          (v: any) => v._id === item.variantId
        );

        const handleClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (item.reviewStatus === "pending") {
            console.log("Items", item);
            onRate?.(item);
          } else if (item.reviewStatus === "completed") {
            router.push(`/rating/view?bookId=${item.book?._id}`);
          }
        };

        return (
          <div
            key={idx}
            className="flex items-center justify-between gap-2 py-1 border-b border-gray-700 last:border-0"
          >
            <div className="flex gap-2 items-center flex-1 min-w-0">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src={
                    variant?.image ||
                    item.book?.images?.[0]?.url ||
                    "/placeholder.jpg"
                  }
                  alt={item.book?.title || "Book"}
                  fill
                  className="object-cover rounded border border-gray-700"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate max-w-[200px] sm:max-w-[280px]">
                  {item.book?.title}
                </p>
                {variant && (
                  <p className="text-xs text-gray-400">
                    {variant.rarity} • {item.quantity}x
                  </p>
                )}
              </div>
            </div>

            {item.reviewStatus !== "unknown" && item.reviewStatus && (
              <button
                onClick={handleClick}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                  item.reviewStatus === "pending"
                    ? "bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_10px_rgba(255,200,0,0.5)]"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_10px_rgba(0,100,255,0.5)]"
                }`}
              >
                {item.reviewStatus === "pending" ? "Đánh giá" : "Xem đánh giá"}
              </button>
            )}
          </div>
        );
      })}

      {items.length > 2 && (
        <span className="text-xs text-gray-500 block text-right mt-1">
          +{items.length - 2} sản phẩm khác
        </span>
      )}
    </div>
  );
}
