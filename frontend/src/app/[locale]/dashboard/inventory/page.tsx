"use client";

import { Book, BookVariant } from "@/interfaces/Book";
import { bookService } from "@/services/bookService";
import { formatCurrency } from "@/utils/format";
import { Button } from "flowbite-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import InventoryModal from "./components/ActionModal";
import { FALLBACK_BOOK } from "@/constants";

interface InventoryItem {
  book: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  note?: string;
  purchaseInvoice?: string;
}

export default function BookSearchInventory() {
  const [searchKey, setSearchKey] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [showModal, setShowModal] = useState(false);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  const [books, setBooks] = useState<Book[]>([]);

  const handleGetBook = async () => {
    const res = await bookService.getBooks(searchKey);
    setBooks(res);
    setFilteredBooks(res);
  };

  // Filter books based on search key
  useEffect(() => {
    handleGetBook();
  }, [searchKey]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setSearchKey(book.title);
    setShowDropdown(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Search Section */}
      <div className="mb-8">
        <div className="relative" ref={searchRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm kiếm sách
          </label>
          <div className="flex items-end justify-between gap-4">
            <input
              type="text"
              placeholder="Nhập tên sách, tác giả hoặc nhà xuất bản..."
              className="min-w-[600px] border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchKey}
              onChange={(e) => {
                setSearchKey(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
            <Button color={"green"} onClick={() => setShowModal(true)}>
              Tạo hóa đơn
            </Button>
          </div>

          {/* Dropdown suggestions */}
          {showDropdown && filteredBooks.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-10 min-w-[600px] mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {filteredBooks.map((book) => (
                <div
                  key={book._id}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                  onClick={() => handleBookSelect(book)}
                >
                  <div className="font-semibold text-gray-900">
                    {book.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    Tác giả: {book.author} | NXB: {book.publisher} | Năm:{" "}
                    {book.releaseYear}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {book?.variants?.length} biến thể có sẵn
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Book Details */}
      {selectedBook && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
            <h2 className="text-2xl font-bold mb-2">{selectedBook.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-100">
              <div>
                <span className="font-medium">Tác giả:</span>{" "}
                {selectedBook.author}
              </div>
              <div>
                <span className="font-medium">Nhà xuất bản:</span>{" "}
                {selectedBook.publisher}
              </div>
              <div>
                <span className="font-medium">Năm phát hành:</span>{" "}
                {selectedBook.releaseYear}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Mô tả:</h3>
              <p className="text-gray-600 leading-relaxed">
                {selectedBook.description}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Các biến thể có sẵn ({selectedBook?.variants?.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-gray-50 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                        Loại
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                        Ảnh minh họa
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                        Giá bán
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                        Tồn kho
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                        ISBN
                      </th>
                      {/* <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                        Thao tác
                      </th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBook?.variants?.map((variant, idx) => (
                      <tr
                        key={variant._id}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border border-gray-300 px-4 py-3">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              variant.rarity === "common"
                                ? "bg-green-100 text-green-800"
                                : variant.rarity === "rare"
                                ? "bg-yellow-100 text-yellow-800"
                                : variant.rarity === "limited"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {variant.rarity}
                          </span>
                        </td>
                        <td className="border flex justify-center border-gray-300 px-4 py-3">
                          <Image
                            src={variant.image ? variant.image : FALLBACK_BOOK}
                            alt="Ảnh minh họa"
                            width={40}
                            height={40}
                            className="w-16 h-16 rounded object-cover"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-3 font-semibold text-green-600">
                          {formatCurrency(variant.price)}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <span
                            className={`font-medium ${
                              variant.stock < 50
                                ? "text-red-600"
                                : variant.stock < 200
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {variant.stock.toLocaleString()} cuốn
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-600">
                          {variant.isbn || "Không có"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      <InventoryModal show={showModal} setShow={setShowModal} />
    </div>
  );
}
