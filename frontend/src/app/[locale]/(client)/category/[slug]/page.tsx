"use client";

import React, { useEffect, useState } from "react";
import { bookService } from "@/services/bookService";
import BookList from "@/app/components/book/BookList";
import Pagination from "@/components/pagination/pagination";
import { useCategoryStore } from "@/store/categoryStore";
import { categoryService } from "@/services/categoryService";
import { MAX_LIMIT } from "@/constants";
import Book from "@/interfaces/Book";
import Category from "@/interfaces/Category";

export default function CategoryPage() {
  const { category, setCategory } = useCategoryStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchKey, setSearchKey] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchBooks = async (page = 1, limit = 10) => {
    if (!category?._id) return;
    const res = await bookService.getBooksByCategory(
      category ? category._id : categories[0]._id,
      page,
      limit
    );
    setBooks(res.items);
    setTotalItems(res.total);
    setCurrentPage(res.page);
    setPageSize(res.limit);
  };

  const fetchCategory = async () => {
    const res = await categoryService.getCategories(searchKey, 1, MAX_LIMIT);
    setCategories(res.items);
  };

  useEffect(() => {
    fetchBooks(currentPage, pageSize);
  }, [category?._id, currentPage, pageSize]);

  useEffect(() => {
    fetchCategory();
  }, [searchKey]);

  const handleSetNewCategory = (newCategory: Category) => {
    setCategory(newCategory);
    setCurrentPage(1); // reset về trang 1 khi đổi category
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="grid grid-cols-12 gap-8">
        {/* Bên trái: Danh sách category */}
        <div className="col-span-3">
          <div className="bg-white p-4 rounded-2xl shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Thể loại
            </h2>

            {/* Ô search */}
            <input
              type="text"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchCategory();
              }}
              placeholder="Tìm thể loại..."
              className="w-full border-gray-300 px-3 py-2 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-shadow"
            />

            {/* Danh sách category */}
            <div className="flex flex-col space-y-1">
              {(showAll ? categories : categories.slice(0, 10)).map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleSetNewCategory(cat)}
                  className={`flex items-center px-4 py-2 rounded-lg text-left transition group ${
                    category?._id === cat._id
                      ? "bg-blue-50 text-cyan-shadow border-l-4 border-cyan-shadow font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}

              {/* Nút xem thêm */}
              {categories.length > 10 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-sm text-cyan-shadow hover:underline mt-2"
                >
                  {showAll
                    ? "Ẩn bớt"
                    : `Xem thêm (còn ${categories.length - 10} thể loại)`}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bên phải: Thông tin category + danh sách sách */}
        <div className="col-span-9">
          {category && (
            <div className="mb-8 p-6 rounded-2xl shadow">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-gray-600 mb-1">{category.description}</p>
              )}
              {category.ageRange && (
                <p className="text-sm text-gray-500">
                  Độ tuổi phù hợp: {category.ageRange}
                </p>
              )}
            </div>
          )}

          {/* Danh sách sách */}
          <BookList books={books} />

          {/* Pagination */}
          {books?.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                totalItems={totalItems}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={(page) => fetchBooks(page, pageSize)}
                onPageSizeChange={(size) => fetchBooks(1, size)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
