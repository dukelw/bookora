"use client";

import React, { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa";
import Book from "@/interfaces/Book";
import { bookService } from "@/services/bookService";
import { categoryService } from "@/services/categoryService";
import Pagination from "@/components/pagination/pagination";
import BookList from "@/app/components/book/BookList";
import { useTranslations } from "use-intl";

export default function BestsellersPage() {
  const b = useTranslations("book");

  const [books, setBooks] = useState<Book[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(12);

  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [category, setCategory] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [publisher, setPublisher] = useState<string>("");

  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [authorOptions, setAuthorOptions] = useState<string[]>([]);
  const [publisherOptions, setPublisherOptions] = useState<string[]>([]);

  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [catRes, bookRes] = await Promise.all([
          categoryService.getCategories(),
          bookService.getBooks(),
        ]);
        setCategoryOptions(catRes.items || []);

        const authorSet = new Set<string>();
        const publisherSet = new Set<string>();
        (bookRes.items || []).forEach((b: any) => {
          if (b.author) authorSet.add(b.author);
          if (b.publisher) publisherSet.add(b.publisher);
        });

        setAuthorOptions(Array.from(authorSet));
        setPublisherOptions(Array.from(publisherSet));
      } catch (err) {
        console.error("Failed to load filter options:", err);
      }
    };

    loadFilters();
  }, []);

  const fetchBestsellers = async (page = 1, limit = 12) => {
    try {
      const params: any = {
        limit,
        sort: sortOrder,
        ...(from && { from }),
        ...(to && { to }),
        ...(category && { category }),
        ...(author && { author }),
        ...(publisher && { publisher }),
      };

      const res = await bookService.getBestSellers(params);
      const items = res.items || [];

      const enriched = await Promise.all(
        items.map(async (b: any) => {
          try {
            const detail = await bookService.getBook(b._id);
            return {
              ...detail,
              sold: b.sold, // giữ lại số sold từ danh sách gốc
            };
          } catch (err) {
            console.error(`Failed to fetch book ${b._id}`, err);
            return {
              ...b,
              category: [],
              images: b.mainImage ? [{ url: b.mainImage, isMain: true }] : [],
            };
          }
        })
      );

      // 3️⃣ Cập nhật state
      setBooks(enriched);
      setTotalItems(res.meta?.count || items.length);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch bestsellers:", error);
    }
  };

  useEffect(() => {
    fetchBestsellers(currentPage, limit);
  }, [limit, category, author, publisher, sortOrder]);

  return (
    <div className="p-6 flex flex-col items-center min-h-[70vh] max-w-7xl mx-auto">
      <div className="mx-auto w-full flex items-center justify-between bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-2xl px-6 py-4 shadow-md overflow-hidden mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-wide">
              {b("bestsellers")}
            </h2>
            <p className="text-sm text-cyan-100">{b("bestsellerTitle")}</p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold bg-cyan-100 text-cyan-700 rounded-full">
            {b("hot")}
          </span>
        </div>
        <span className="text-sm text-gray-100 italic">{b("lastUpdate")}</span>
      </div>

      <div className="w-[98%] grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:hidden w-full mb-4">
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="flex items-center justify-center gap-2 w-full bg-cyan-600 text-white py-2 rounded-lg shadow hover:bg-cyan-700 transition"
          >
            <FaFilter className="text-sm" /> <span>{b("filter")}</span>
          </button>
          {showMobileFilter && (
            <div className="mt-4 bg-white rounded-2xl shadow p-5 animate-fadeIn">
              <FilterInputs mobile />
            </div>
          )}
        </div>

        <div className="hidden lg:block bg-white rounded-2xl shadow p-5 h-fit lg:sticky lg:top-20">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaFilter className="text-cyan-600" /> {b("filter")}
          </h2>
          <FilterInputs />
        </div>

        <div className="lg:col-span-3">
          <BookList books={books} />
          <style jsx global>{`
            .book-card {
              position: relative;
            }
            .book-card::before {
              content: "HOT";
              position: absolute;
              top: 8px;
              left: 8px;
              background: #f97316;
              color: white;
              font-size: 12px;
              font-weight: 700;
              padding: 2px 7px;
              border-radius: 4px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
              z-index: 5;
            }
          `}</style>

          {books.length > 0 && (
            <div className="mt-10 flex justify-center">
              <Pagination
                totalItems={totalItems}
                currentPage={currentPage}
                pageSize={limit}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(size) => setLimit(size)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function FilterInputs({ mobile = false }: { mobile?: boolean }) {
    return (
      <div
        className={`${
          mobile
            ? "grid grid-cols-2 sm:grid-cols-3 gap-4 w-full"
            : "flex flex-col gap-4 w-full"
        }`}
      >
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {b("sort")}
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
            className="w-full border border-gray-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 px-3 py-2 rounded-lg text-sm"
          >
            <option value="desc">{b("bestselling")}</option>
            <option value="asc">{b("leastSelling")}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {b("fromDate")}
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 px-3 py-2 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {b("toDate")}
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 px-3 py-2 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {b("category")}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 px-3 py-2 rounded-lg text-sm"
          >
            <option value="">{b("all")}</option>
            {categoryOptions.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {b("author")}
          </label>
          <select
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full border border-gray-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 px-3 py-2 rounded-lg text-sm"
          >
            <option value="">{b("all")}</option>
            {authorOptions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {b("publisher")}
          </label>
          <select
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            className="w-full border border-gray-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 px-3 py-2 rounded-lg text-sm"
          >
            <option value="">{b("all")}</option>
            {publisherOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }
}
