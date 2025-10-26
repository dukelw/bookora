"use client";

import { useState, useEffect, useRef } from "react";
import Book from "@/interfaces/Book";
import { bookService } from "@/services/bookService";
import { formatCurrency } from "@/utils/format";
import { Button, Breadcrumb, BreadcrumbItem, HomeIcon } from "flowbite-react";
import Image from "next/image";
import InventoryModal from "./components/ActionModal";
import { FaSearch, FaPlus } from "react-icons/fa";
import { FALLBACK_BOOK } from "@/constants";
import { useTranslations } from "use-intl";

// Dropdown item component
const BookDropdownItem = ({
  book,
  onSelect,
  t,
}: {
  book: Book;
  onSelect: (b: Book) => void;
  t: any;
}) => (
  <div
    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
    onClick={() => onSelect(book)}
  >
    <div className="font-semibold text-gray-900">{book.title}</div>
    <div className="text-sm text-gray-600">
      {t("p.author")}: {book.author} | {t("p.publisher")}: {book.publisher} |{" "}
      {t("p.releaseYear")}: {book.releaseYear}
    </div>
    <div className="text-xs text-blue-600 mt-1">
      {book?.variants?.length} {t("i.availableVariants")}
    </div>
  </div>
);

export default function BookSearchInventory() {
  const t = useTranslations("dashboard");
  const m = useTranslations("sidebar");

  const [searchKey, setSearchKey] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!searchKey.trim()) {
        setBooks([]);
        setFilteredBooks([]);
        return;
      }
      const res = await bookService.getBooks(searchKey);
      setBooks(res.items);
      setFilteredBooks(res.items);
    };
    fetchBooks();
  }, [searchKey]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setSearchKey(book.title);
    setShowDropdown(false);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb aria-label="breadcrumb" className="px-5 py-3">
        <BreadcrumbItem href="#" icon={HomeIcon}>
          Dashboard
        </BreadcrumbItem>
        <BreadcrumbItem href="#">{m("productManagement")}</BreadcrumbItem>
        <BreadcrumbItem>{m("inventory")}</BreadcrumbItem>
      </Breadcrumb>
      <div className="p-6 shadow rounded-2xl">
        <div className="relative mb-6" ref={searchRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("i.searchBook")}
          </label>
          <div className="flex items-end gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t("i.searchPlaceholder")}
                className="w-full border border-gray-300 rounded-lg px-10 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchKey}
                onChange={(e) => {
                  setSearchKey(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <Button
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => setShowModal(true)}
            >
              <FaPlus />
            </Button>
          </div>

          {/* Dropdown suggestions */}
          {showDropdown && filteredBooks.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {filteredBooks.map((book) => (
                <BookDropdownItem
                  key={book._id}
                  book={book}
                  onSelect={handleBookSelect}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>

        {/* Selected Book */}
        {selectedBook && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
              <h2 className="text-2xl font-bold mb-2">{selectedBook.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-100">
                <div>
                  <span className="font-medium">{t("p.author")}:</span>{" "}
                  {selectedBook.author}
                </div>
                <div>
                  <span className="font-medium">{t("p.publisher")}:</span>{" "}
                  {selectedBook.publisher}
                </div>
                <div>
                  <span className="font-medium">{t("p.releaseYear")}:</span>{" "}
                  {selectedBook.releaseYear}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">
                  {t("p.description")}:
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {selectedBook.description}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {t("i.availableVariants")} ({selectedBook?.variants?.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-gray-50 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                          {t("p.category")}
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                          {t("i.image")}
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                          {t("p.price")}
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                          {t("p.stock")}
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                          ISBN
                        </th>
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
                            <img
                              src={variant.image ?? FALLBACK_BOOK}
                              alt="Ảnh minh họa"
                              width="40"
                              height="40"
                              className="w-16 h-16 rounded object-cover"
                              loading="lazy"
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
                            {variant.isbn ?? "Không có"}
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
    </div>
  );
}
