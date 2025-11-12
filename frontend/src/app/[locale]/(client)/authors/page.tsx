"use client";

import React, { useEffect, useState } from "react";
import { bookService } from "@/services/bookService";
import BookList from "@/app/components/book/BookList";
import Pagination from "@/components/pagination/pagination";
import AuthorList from "./components/AuthorList";
import Book from "@/interfaces/Book";
import { toast } from "react-toastify";
import { useTranslations } from "use-intl";

export default function AuthorsPage() {
  const t = useTranslations("authors");

  const [authors, setAuthors] = useState<{ author: string; books: number }[]>(
    []
  );
  const [activeAuthor, setActiveAuthor] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [authorMeta, setAuthorMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [bookMeta, setBookMeta] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const fetchAuthors = async (searchValue = "", page = 1, limit = 20) => {
    try {
      const res = await bookService.getAuthors({
        search: searchValue,
        page,
        limit,
      });
      setAuthors(res.items);
      setAuthorMeta(res.meta);
    } catch {
      toast.error(t("fetchAuthorFailed"));
    }
  };

  const fetchBooksByAuthor = async (author?: string, page = 1, limit = 12) => {
    try {
      let res;
      if (author) {
        res = await bookService.getBooksByAuthor(author, { page, limit });
      } else {
        res = await bookService.getBooks(undefined, page, limit);
      }

      const rawBooks = Array.isArray(res?.items) ? res.items : [];
      const safeBooks = rawBooks.map((b: any) => ({
        ...b,
        images: Array.isArray(b.images) ? b.images : [],
        variants: Array.isArray(b.variants) ? b.variants : [],
        category: Array.isArray(b.category) ? b.category : [],
        mainImage:
          b.mainImage || b?.images?.[0]?.url || "/images/placeholder.png",
      }));

      setBooks(safeBooks);
      setBookMeta({
        page: res.meta?.page || res.page || 1,
        limit: res.meta?.limit || res.limit || 12,
        total: res.meta?.total || res.total || 0,
        totalPages: res.meta?.totalPages || res.totalPages || 0,
      });
    } catch {
      setBooks([]);
      toast.error(t("fetchBook"));
    }
  };

  useEffect(() => {
    fetchAuthors();
    fetchBooksByAuthor();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchAuthors(search, 1, authorMeta.limit);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    fetchBooksByAuthor(activeAuthor || undefined);
  }, [activeAuthor]);

  const handleSelectAuthor = (author: string) => {
    setActiveAuthor(author);
    setBookMeta({ ...bookMeta, page: 1 });
  };

  return (
    <div className="container mx-auto py-8 px-6 md:px-0 max-w-7xl">
      <div className="flex gap-2 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg"
          placeholder={t("placeholderSearch")}
        />
      </div>
      <AuthorList
        authors={authors}
        onSelect={handleSelectAuthor}
        activeAuthor={activeAuthor}
      />
      <div className="mt-8">
        {activeAuthor && (
          <h2 className="text-2xl font-semibold mb-4">
            {t("title")}{" "}
            <span className="text-cyan-600 font-bold">{activeAuthor}</span>
          </h2>
        )}
        <BookList books={books || []} />
        {books.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              totalItems={bookMeta.total}
              currentPage={bookMeta.page}
              pageSize={bookMeta.limit}
              onPageChange={(p) =>
                fetchBooksByAuthor(activeAuthor || undefined, p, bookMeta.limit)
              }
              onPageSizeChange={(s) =>
                fetchBooksByAuthor(activeAuthor || undefined, 1, s)
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
