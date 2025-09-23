"use client";

import React from "react";
import Image from "next/image";
import { FaShoppingCart } from "react-icons/fa";
import { Book } from "@/interfaces/Book";
import { useRouter } from "next/navigation";
import { useBookStore } from "@/store/bookStore";

interface BookListProps {
  books: Book[];
  title?: string;
}

export default function BookList({ books, title }: BookListProps) {
  const router = useRouter();
  const { setBookId } = useBookStore();
  if (!books || books.length === 0) {
    return <p className="text-center text-gray-500">No books available</p>;
  }

  const handleGoToDetail = async (book: Book) => {
    setBookId(book._id);
    router.push(`/book/${book.slug}`);
  };

  return (
    <div className="mt-6">
      {title && (
        <h2 className="text-2xl font-bold mb-6 text-center text-cyan">
          {title}
        </h2>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {books.map((book) => (
          <div
            onClick={() => {
              handleGoToDetail(book);
            }}
            key={book._id}
            className="cursor-pointer bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300"
          >
            {/* Image */}
            <div className="relative h-48">
              {book?.images[0] ? (
                <Image
                  src={
                    book.images.find((img) => img.isMain)?.url ||
                    book.images[0].url
                  }
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No Image
                </div>
              )}

              {/* Icon thêm vào giỏ */}
              <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition-colors">
                <FaShoppingCart className="text-black" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                {book.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                {book.author}
              </p>
              <p className="text-xs text-gray-500 flex-1 mb-2 line-clamp-3">
                {book.description}
              </p>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-2">
                {book.category.map((cat) => (
                  <span
                    key={cat._id}
                    className="text-xs px-2 py-1 rounded-full border border-gray-300 bg-gray-100 text-gray-700"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
