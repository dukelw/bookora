"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { bookService } from "@/services/bookService";
import Image from "next/image";
import { Book, BookImage, BookVariant } from "@/interfaces/Book";
import { FaShoppingCart, FaHeart } from "react-icons/fa";
import Link from "next/link";
import ReviewSlider from "./components/ReviewSlider";
import { useBookStore } from "@/store/bookStore";

export default function BookDetailPage() {
  const { bookId } = useBookStore();

  const [book, setBook] = useState<Book | null>(null);
  const [mainImage, setMainImage] = useState<string>("");

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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Tiêu đề */}
      <h1 className="text-5xl font-extrabold text-cyan-600">{book.title}</h1>
      <p className="text-gray-500 text-lg">
        {book.author} — {book.publisher} ({book.releaseYear})
      </p>

      <div className="grid grid-cols-4 gap-6">
        {/* Biến thể */}
        <div className="col-span-1 flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-2">Các phiên bản</h2>
          {book?.variants?.map((v: BookVariant, idx: number) => {
            const colorClass = variantColors[idx % variantColors.length];
            return (
              <div
                key={v._id}
                onClick={() => {
                  // Nếu variant có image riêng thì ưu tiên, còn không thì giữ ảnh cũ
                  if (v.image) {
                    setMainImage(v.image);
                  }
                }}
                className={`border-2 ${colorClass} rounded-xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer`}
              >
                <p className="font-semibold capitalize">{v.rarity}</p>
                <p className="text-lg font-bold">
                  {v.price.toLocaleString("vi-VN")} ₫
                </p>
                <p className="text-sm">Tồn kho: {v.stock}</p>
                <p className="text-sm">ISBN: {v.isbn || "-"}</p>
              </div>
            );
          })}
        </div>

        {/* Hình ảnh + Thông tin */}
        <div className="col-span-3 flex gap-6">
          <div className="flex-1">
            {/* Ảnh chính */}
            <Image
              width={600}
              height={400}
              src={mainImage}
              alt={book.title}
              className="w-full h-[400px] object-cover rounded-xl shadow-lg"
            />

            {/* Thumbnail */}
            <div className="flex gap-3 mt-4">
              {book?.images
                ?.filter((img) => img.url !== mainImage)
                .slice(0, 4)
                .map((img) => (
                  <Image
                    width={80}
                    height={80}
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
          <div className="w-1/3 space-y-4">
            <h2 className="text-xl font-semibold">Thông tin sách</h2>
            <p className="text-gray-500">
              <span className="font-medium text-gray-700">Mô tả:</span>{" "}
              {book.description}
            </p>
            <div>
              <span className="font-medium text-gray-700">Danh mục:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {book.category.map((c) => (
                  <span
                    key={c._id}
                    className="px-3 py-1 border border-cyan-500 text-cyan-600 rounded-full text-sm bg-cyan-50"
                  >
                    <Link href={`/category/${c._id}`}>{c.name}</Link>
                  </span>
                ))}
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex gap-4 mt-6">
              <button className="p-2 border rounded-lg text-red-500 hover:bg-red-50 transition">
                <FaHeart />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg shadow hover:bg-cyan-700 transition">
                <FaShoppingCart /> Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Đánh giá (Review Cards) */}
      <div className="mt-10">
        <ReviewSlider bookId={bookId} />
      </div>

      {/* Bình luận */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          💬 Bình luận
        </h2>

        {/* List comment */}
        <div className="space-y-5">
          {[
            {
              id: 1,
              user: "Nguyễn Văn A",
              date: "2025-09-20",
              comment: "Sách rất hay, giấy in đẹp và nội dung cuốn hút.",
            },
            {
              id: 2,
              user: "Trần Thị B",
              date: "2025-09-18",
              comment: "Tác phẩm ấn tượng nhưng giao hơi chậm.",
            },
          ].map((cmt) => (
            <div
              key={cmt.id}
              className="flex gap-3 p-4 rounded-xl bg-gradient-to-r from-white to-cyan-50 shadow-sm hover:shadow-md transition"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
                {cmt.user[0]}
              </div>

              {/* Nội dung */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-800">{cmt.user}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(cmt.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-gray-700">{cmt.comment}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form comment */}
        <div className="mt-8 p-5 bg-gray-50 rounded-xl shadow-inner">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Viết bình luận ✍️
          </h3>
          <textarea
            placeholder="Chia sẻ cảm nhận của bạn..."
            className="w-full p-3 border-none rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            rows={3}
          />
          <button className="mt-3 px-5 py-2 bg-cyan-500 text-white rounded-lg shadow-md hover:bg-cyan-600 hover:shadow-lg transition">
            🚀 Gửi bình luận
          </button>
        </div>
      </div>
    </div>
  );
}
