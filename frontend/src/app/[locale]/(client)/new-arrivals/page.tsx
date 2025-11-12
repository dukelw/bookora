"use client";

import React, { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa";
import Book from "@/interfaces/Book";
import { bookService } from "@/services/bookService";
import { categoryService } from "@/services/categoryService";
import Pagination from "@/components/pagination/pagination";
import BookList from "@/app/components/book/BookList";
import { useTranslations } from "use-intl";

export default function NewArrivalsPage() {
  const b = useTranslations("book");

  const [books, setBooks] = useState<Book[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(12);

  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [from, setFrom] = useState(() => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 2);
    return oneMonthAgo.toISOString().split("T")[0];
  });

  const [days, setDays] = useState(30);

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

  const fetchNewBooks = async (page = 1, limit = 10) => {
    try {
      const params: any = {
        page,
        limit,
        days,
        ...(from && { from }),
        ...(category && { category }),
        ...(author && { author }),
        ...(publisher && { publisher }),
      };

      const res = await bookService.getNewReleases(params);
      const sortedItems =
        sortOrder === "oldest" ? [...res.items].reverse() : res.items;
      const mapped = sortedItems.map((b: any) => {
        return {
          ...b,
          category: Array.isArray(b.category)
            ? b.category
            : b.category
            ? [b.category]
            : [],
          images: b.mainImage ? [{ url: b.mainImage, isMain: true }] : [],
        };
      });

      setBooks(mapped);
      setTotalItems(res.meta?.total);
      setCurrentPage(res.meta.page);
    } catch (error) {
      console.error("Failed to fetch new arrivals:", error);
    }
  };

  useEffect(() => {
    fetchNewBooks(currentPage, limit);
  }, [limit, from, days, category, author, publisher, sortOrder, currentPage]);

  return (
    <div className="p-6 flex flex-col items-center min-h-[70vh] max-w-7xl mx-auto">
      {/* Mobile layout */}
      <div className="mx-auto w-full flex md:hidden items-center justify-between bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-2xl px-6 py-4 shadow-md overflow-hidden mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
          {/* Hàng trên */}
          <div className="flex items-center gap-2 md:gap-3">
            <h2 className="text-xl font-semibold tracking-wide">
              {b("newArrivals")}
            </h2>
            <span className="px-3 py-1 text-xs font-semibold bg-cyan-100 text-cyan-700 rounded-full">
              {b("new")}
            </span>
            <span className="text-sm text-gray-100 italic">
              {b("lastUpdate")}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-cyan-100 md:ml-0">{b("title")}</p>
        </div>
      </div>

      {/* PC layout */}
      <div className="mx-auto w-full hidden md:flex items-center justify-between bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-2xl px-6 py-4 shadow-md overflow-hidden mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-wide">
              {b("newArrivals")}
            </h2>
            <p className="text-sm text-cyan-100">{b("title")}</p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold bg-cyan-100 text-cyan-700 rounded-full">
            {b("new")}
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
              content: "NEW";
              position: absolute;
              top: 8px;
              left: 8px;
              background: #06b6d4;
              color: white;
              font-size: 11px;
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
            ? "grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
            : "flex flex-col gap-4 w-full"
        }`}
      >
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {b("sort")}
          </label>
          <select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as "newest" | "oldest")
            }
            className="w-full border border-gray-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 px-3 py-2 rounded-lg text-sm"
          >
            <option value="newest">{b("newest")}</option>
            <option value="oldest">{b("oldest")}</option>
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
            className="w-full border border-gray-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 px-3 py-2 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {b("daysRange")}
          </label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full border border-gray-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 px-3 py-2 rounded-lg text-sm"
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
