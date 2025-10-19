"use client";
import { useRatingStore } from "@/store/ratingStore";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RatingPage() {
  const { booksToRate, clearBooksToRate, setCurrentBookToRate } =
    useRatingStore();
  const router = useRouter();

  if (booksToRate.length === 0) {
    router.push("/orders");
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold text-green-700 mb-4">
        Đánh giá sản phẩm
      </h1>

      {booksToRate.map((book: any) => (
        <div
          key={book.bookId}
          className="flex items-center gap-4 bg-white border border-gray-200 p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
        >
          {/* Thumbnail sách 120x120 */}
          <div className="relative flex-shrink-0">
            <Image
              src={book.thumbnail || "/default-book.png"}
              alt={book.title}
              width={120}
              height={120}
              className="object-cover rounded-lg"
            />
          </div>

          <div className="flex-1 space-y-1">
            <h2 className="text-lg font-medium text-gray-800">{book.title}</h2>

            {book.author && (
              <p className="text-gray-700 text-sm">
                <span className="font-medium">Tác giả:</span> {book.author}
              </p>
            )}
            {book.publisher && (
              <p className="text-gray-700 text-sm">
                <span className="font-medium">Nhà phát hành:</span>{" "}
                {book.publisher}
              </p>
            )}

            {book.variant && (
              <div className="mt-1 flex items-center gap-2">
                {book.variant.image && (
                  <Image
                    src={book.variant.image}
                    alt={book.variant.rarity || "Biến thể"}
                    width={120}
                    height={120}
                    className="object-cover rounded-lg border border-gray-200"
                  />
                )}
                <div>
                  <p className="text-gray-700 text-sm">
                    <span className="font-medium">Biến thể:</span>{" "}
                    {book.variant.rarity || "Không rõ"}
                  </p>
                  {book.variant.price && (
                    <p className="text-gray-900 text-sm font-semibold">
                      Giá: {book.variant.price.toLocaleString()}₫
                    </p>
                  )}
                </div>
              </div>
            )}

            {book.quantity && (
              <p className="text-gray-600 text-sm">
                <span className="font-medium">Số lượng:</span> {book.quantity}
              </p>
            )}
          </div>

          <button
            onClick={() => {
              setCurrentBookToRate(book);
              router.push(`/rating/${book.slug}`);
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium shadow transition-colors duration-200"
          >
            Đánh giá
          </button>
        </div>
      ))}

      <div className="flex justify-end mt-2">
        <button
          onClick={() => {
            clearBooksToRate();
            router.push("/orders");
          }}
          className="text-green-700 hover:text-green-800 text-sm font-medium transition"
        >
          ← Quay lại đơn hàng
        </button>
      </div>
    </div>
  );
}
