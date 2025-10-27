"use client";

import { useState, useEffect } from "react";
import { TextInput, Spinner } from "flowbite-react";
import { useTranslations } from "use-intl";
import { bookService } from "@/services/bookService";
import { useRouter } from "next/navigation";
import { useBookStore } from "@/store/bookStore";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const t = useTranslations("home");
  const router = useRouter();
  const { setBookId } = useBookStore();

  // debounce 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(handler);
  }, [query]);

  // call API khi debouncedQuery thay đổi
  useEffect(() => {
    const fetchBooks = async () => {
      if (debouncedQuery.trim() === "") {
        setBooks([]);
        return;
      }

      try {
        setLoading(true);
        const data = await bookService.getBooks(debouncedQuery);
        setBooks(data?.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [debouncedQuery]);

  const handleSelectBook = (bookId: string) => {
    setBookId(bookId);
    setQuery("");
    setBooks([]);
    router.push(`/book/${bookId}`);
  };

  return (
    <div className="relative w-full min-w-[280px]">
      <TextInput
        type="text"
        placeholder={t("typeToSearch")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-xl focus:ring-2 focus:ring-green-400"
      />

      {/* dropdown kết quả */}
      {query && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {loading && (
            <div className="flex justify-center p-3">
              <Spinner size="sm" />
            </div>
          )}

          {!loading && books.length === 0 && (
            <div className="text-gray-500 text-sm p-3">
              Không tìm thấy kết quả
            </div>
          )}

          {!loading &&
            books.map((book) => (
              <div
                key={book._id}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectBook(book._id)}
              >
                <div className="relative w-10 h-14 flex-shrink-0">
                  <img
                    src={
                      book.images?.find((img: any) => img.isMain)?.url ||
                      "/images/fallback/book-fallback.png"
                    }
                    alt={book.title}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-medium text-gray-800">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {book.author} • {book.releaseYear}
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
