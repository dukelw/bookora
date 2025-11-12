"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { bookService } from "@/services/bookService";
import Image from "next/image";
import { FaShoppingCart, FaHeart } from "react-icons/fa";
import Link from "next/link";
import ReviewSlider from "./components/ReviewSlider";
import { useBookStore } from "@/store/bookStore";
import { useCategoryStore } from "@/store/categoryStore";
import CartModal from "./components/CartModal";
import { cartService } from "@/services/cartService";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import { useCartStore } from "@/store/cartStore";
import Book from "@/interfaces/Book";
import BookImage from "@/interfaces/BookImage";
import Category from "@/interfaces/Category";
import BookVariant from "@/interfaces/BookVariant";
import CommentSection from "./components/CommentSection";
import { getOrCreateGuestId } from "@/lib/guest";
import WishlistButton from "@/app/components/wishlist/WishlistButton";
import { useTranslations } from "use-intl";

export default function BookDetailPage() {
  const { bookId } = useBookStore();
  const { user } = useAuthStore();
  const { setCategory } = useCategoryStore();
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const { setCart } = useCartStore();
  const t = useTranslations("bookDetail");

  useEffect(() => {
    if (!bookId) return;
    (async () => {
      const data = await bookService.getBook(bookId);
      setBook(data);
      const main =
        data.images.find((img: BookImage) => img.isMain) || data.images[0];
      setMainImage(main?.url);
    })();
  }, [bookId]);

  if (!book) return <p className="text-center mt-10">Đang tải...</p>;

  const variantColors = [
    "border-red-400 text-red-500",
    "border-purple-400 text-purple-500",
    "border-green-400 text-green-600",
    "border-emerald-800 text-emerald-800", // dark-green
    "border-blue-400 text-blue-500",
  ];

  const handleGoToCategory = async (category: Category) => {
    setCategory(category);
    router.push(`/category/${category.slug}`);
  };

  const handleAddToCart = async (
    items: { variant: BookVariant; quantity: number }[]
  ) => {
    try {
      const ownerId = user?._id || getOrCreateGuestId();
      await Promise.all(
        items.map((item) =>
          cartService.addToCart({
            userId: ownerId,
            bookId: bookId ?? "",
            variantId: item.variant._id,
            quantity: item.quantity,
          })
        )
      );

      const updatedCart = await cartService.getCart(ownerId);
      setCart(updatedCart);
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi khi thêm giỏ hàng");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Tiêu đề */}
      <h1 className="text-3xl md:text-5xl font-extrabold text-cyan-600">
        {book.title}
      </h1>

      <p className="text-gray-500 text-lg">
        {book.author} — {book.publisher} ({book.releaseYear})
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Biến thể */}
        <div className="order-2 md:order-1 col-span-1 flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-2">{t("variants")}</h2>
          {book?.variants?.map((v: BookVariant, idx: number) => {
            const colorClass = variantColors[idx % variantColors.length];
            return (
              <div
                key={v._id}
                onClick={() => {
                  if (v.image) setMainImage(v.image);
                }}
                className={`border-2 ${colorClass} rounded-xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-start gap-4`}
              >
                {/* Hình bên trái */}
                {v.image && (
                  <img
                    src={v.image}
                    alt={v.rarity}
                    className="w-20 h-20 object-cover rounded-md border border-gray-200 flex-shrink-0"
                  />
                )}

                {/* Thông tin bên phải */}
                <div className="flex flex-col justify-between">
                  <p className="font-semibold capitalize">{v.rarity}</p>
                  <p className="text-lg font-bold">
                    {v.price.toLocaleString("vi-VN")} ₫
                  </p>
                  <p className="text-sm">{t("stock")}: {v.stock}</p>
                  <p className="text-sm">{t("isbn")}: {v.isbn || "-"}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hình ảnh + Thông tin */}
        <div className="col-span-3 flex flex-col md:flex-row gap-6 order-1 md:order-2">
          <div className="flex-1">
            {/* Ảnh chính */}
            <img
              src={mainImage}
              alt={book.title}
              className="w-full h-[250px] md:h-[400px] object-cover rounded-xl shadow-lg"
            />

            {/* Thumbnail */}
            <div className="flex gap-3 mt-4">
              {book?.images
                ?.filter((img) => img.url !== mainImage)
                .slice(0, 4)
                .map((img) => (
                  <img
                    key={img._id}
                    src={img.url}
                    alt="thumb"
                    onClick={() => setMainImage(img.url)}
                    className="w-20 h-20 object-cover rounded-md border cursor-pointer hover:ring-2 hover:ring-cyan-400"
                  />
                ))}
            </div>
          </div>

          {/* Thông tin cơ bản */}
          <div className="md:w-1/3 space-y-4">
            <h2 className="text-xl font-semibold">{t("bookInfo")}</h2>
            <p className="text-gray-500 text-justify">
              <span className="font-medium text-gray-700">{t("description")}:</span>{" "}
              {book.description}
            </p>

            <div>
              <span className="font-medium text-gray-700">{t("category")}:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {book.category.map((c) => (
                  <span
                    onClick={() => handleGoToCategory(c)}
                    key={c._id}
                    className="cursor-pointer px-3 py-1 border border-cyan-500 text-cyan-600 rounded-full text-sm bg-cyan-50"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6 items-center sm:items-start">
              <div className="flex gap-4 mt-6">
                <WishlistButton
                  bookId={book._id}
                  className="p-2 border rounded-lg hover:bg-red-50 transition"
                  size={18}
                />
                <button
                  onClick={() => setIsCartModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg shadow hover:bg-cyan-700 transition"
                >
                  <FaShoppingCart /> {t("addToCart")}
                </button>
              </div>

              <CartModal
                bookId={bookId ?? ""}
                isOpen={isCartModalOpen}
                onClose={() => setIsCartModalOpen(false)}
                variants={book?.variants ?? []}
                onConfirm={handleAddToCart}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Đánh giá (Review Cards) */}
      <div className="mt-10">
        <ReviewSlider bookId={bookId ?? ""} />
      </div>

      {/* Bình luận */}
      <CommentSection bookId={bookId ?? ""} />
    </div>
  );
}
