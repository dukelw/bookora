"use client";

import React, { useEffect, useState } from "react";
import { Book, Category } from "@/interfaces/Book";
import { bookService } from "@/services/bookService";
import BookList from "@/app/components/book/BookList";
import Pagination from "@/components/pagination/pagination";
import { categoryService } from "@/services/categoryService";
import { MAX_LIMIT } from "@/constants";

export default function CategoryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // fetch categories
  const fetchCategories = async () => {
    const res = await categoryService.getCategories("", 1, MAX_LIMIT);
    setCategories(res.items);
    if (res.items.length > 0) {
      setActiveCategory(res.items[0]); // chọn category đầu tiên mặc định
    }
  };

  // fetch books theo category
  const fetchBooks = async (categoryId: string, page = 1, limit = 10) => {
    const res = await bookService.getBooksByCategory(categoryId, page, limit);
    setBooks(res.items);
    setTotalItems(res.total);
    setCurrentPage(res.page);
    setPageSize(res.limit);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeCategory?._id) {
      fetchBooks(activeCategory._id, currentPage, pageSize);
    }
  }, [activeCategory, currentPage, pageSize]);

  const handleChangeCategory = (cat: Category) => {
    setActiveCategory(cat);
    setCurrentPage(1); // reset về trang 1 khi đổi category
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Tabs Category */}
      <div className="flex flex-wrap gap-3 mb-8 border-b pb-3">
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => handleChangeCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeCategory?._id === cat._id
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Info category */}
      {activeCategory && (
        <div className="mb-8 p-6 rounded-2xl shadow">
          <h1 className="text-3xl font-bold mb-2">{activeCategory.name}</h1>
          {activeCategory.description && (
            <p className="mb-1 text-gray-600">{activeCategory.description}</p>
          )}
          {activeCategory.ageRange && (
            <p className="text-sm text-gray-500">
              Độ tuổi phù hợp: {activeCategory.ageRange}
            </p>
          )}
        </div>
      )}

      {/* Book list */}
      <BookList books={books} />

      {/* Pagination */}
      {books?.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={(page) =>
              activeCategory?._id &&
              fetchBooks(activeCategory._id, page, pageSize)
            }
            onPageSizeChange={(size) =>
              activeCategory?._id && fetchBooks(activeCategory._id, 1, size)
            }
          />
        </div>
      )}
    </div>
  );
}
