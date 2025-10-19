import Image from "next/image";

export default function OrderItemsList({ items }: any) {
  return (
    <div className="text-sm text-gray-300 space-y-2">
      <div className="flex gap-2 overflow-hidden">
        {items.slice(0, 2).map((item: any, idx: number) => {
          const variant = item.book?.variants?.find(
            (v: any) => v._id === item.variantId
          );
          return (
            <div key={idx} className="flex gap-2 items-center">
              <div className="relative w-12 h-12">
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
              <div className="truncate">
                <p className="font-medium text-white truncate">
                  {item.book?.title}
                </p>
                {variant && (
                  <p className="text-xs text-gray-400">
                    {variant.rarity} • {item.quantity}x
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {items.length > 2 && (
          <span className="text-xs text-gray-500 self-center">
            +{items.length - 2} sản phẩm khác
          </span>
        )}
      </div>
    </div>
  );
}
