"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal, ModalBody, Spinner } from "flowbite-react";
import { Search } from "lucide-react";
import { bookService } from "@/services/bookService";
import Image from "next/image";
import { useBookStore } from "@/store/bookStore";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  setKeyword: (val: string) => void;
}

const SearchModal = ({
  isOpen,
  onClose,
  keyword,
  setKeyword,
}: SearchModalProps) => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setBookId } = useBookStore();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (keyword && keyword.trim()) {
        fetchBooks(keyword);
      } else {
        setBooks([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [keyword]);

  const fetchBooks = async (kw: string) => {
    try {
      setLoading(true);
      const data = await bookService.getBooks(kw);
      setBooks(data?.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = (bookId: string) => {
    setBookId(bookId);
    onClose();
    router.push(`/book/${bookId}`);
  };

  return (
    <Modal show={isOpen} size="lg" popup onClose={onClose} dismissible>
      <ModalBody>
        <div className="mt-4 flex items-center gap-2 border rounded-xl px-3 py-2 bg-white shadow-sm">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm sách..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full outline-none border-none ring-0 bg-transparent text-gray-800 placeholder-gray-400 text-sm"
          />
        </div>

        {loading && (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        )}

        {!loading && books.length > 0 && (
          <ul className="mt-4 space-y-2 max-h-80 overflow-y-auto">
            {books.map((book) => (
              <li
                key={book._id}
                onClick={() => handleSelectBook(book._id)}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer transition"
              >
                <div className="relative w-10 h-14 flex-shrink-0">
                  <Image
                    src={
                      book.images?.find((img: any) => img.isMain)?.url ||
                      "/images/fallback/book-fallback.png"
                    }
                    alt={book.title}
                    fill
                    className="object-cover rounded"
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
              </li>
            ))}
          </ul>
        )}

        {!loading && keyword && books.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-4">
            Không tìm thấy kết quả
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default SearchModal;
