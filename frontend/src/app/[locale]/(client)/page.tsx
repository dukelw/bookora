"use client";

import SliderCarousel from "@/app/components/home/Slider";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import { useTranslations } from "use-intl";
import { useEffect, useState } from "react";
import { bookService } from "@/services/bookService";
import BookList from "@/app/components/book/BookList";
import Book from "@/interfaces/Book";

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const { user } = useAuthStore();
  const t = useTranslations("home");

  useEffect(() => {
    const fetchBooks = async () => {
      const res = await bookService.getBooks();
      setBooks(res.items || []);
    };
    fetchBooks();
  }, []);

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[70vh]">
      {/* Slider nằm ngoài shadow */}
      <div className="w-full mb-6">
        <SliderCarousel />
      </div>

      {/* Các BookList nằm trong khung shadow */}
      <div className="flex flex-col items-center justify-center w-full">
        <div className="rounded-xl shadow-lg p-10 w-full">
          <BookList title="New Products" books={books} />
          <BookList title="Best Seller" books={books} />
          <BookList title="Recommend" books={books} />
        </div>
      </div>
    </div>
  );
}
