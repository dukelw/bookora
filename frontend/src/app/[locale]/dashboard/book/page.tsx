"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  TextInput,
  Button,
  Datepicker,
  Dropdown,
  DropdownItem,
  Breadcrumb,
  BreadcrumbItem,
  HomeIcon,
} from "flowbite-react";
import {
  FaSearch,
  FaPlus,
  FaEye,
  FaPen,
  FaTrash,
  FaCube,
  FaChevronDown,
} from "react-icons/fa";
import { formatCurrency } from "@/utils/format";
import ActionModal from "./components/ActionModal";
import { bookService } from "@/services/bookService";
import { categoryService } from "@/services/categoryService";
import { Book } from "@/interfaces/Book";
import { toast } from "react-toastify";
import BaseTable, { Column } from "@/components/table/BaseTable";
import Pagination from "@/components/pagination/pagination";
import ConfirmModal from "@/app/components/ui/modal/ConfirmModal";
import { useTranslations } from "use-intl";
import StockDetailModal from "./components/StockDetailModal";

export default function BookManagementPage() {
  const t = useTranslations("dashboard");
  const m = useTranslations("sidebar");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<{ _id: string; name: string }[]>([]);
  const [releaseYear, setReleaseYear] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Partial<Book> | null>(null);
  const [isVariant, setIsVariant] = useState(false);
  const [detailMode, setDetailMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockBook, setStockBook] = useState<Book | null>(null);

  const [categoryId, setCategoryId] = useState<string | "">("");

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      let res;
      if (categoryId) {
        res = await bookService.getBooksByCategory(
          categoryId,
          currentPage,
          pageSize
        );
      } else {
        res = await bookService.getBooks(search, currentPage, pageSize);
      }
      setBooks(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
      toast.error(t("errorLoad"));
    }
  }, [search, categoryId, currentPage, pageSize, t]);

  const fetchCategory = useCallback(async () => {
    try {
      const res = await categoryService.getCategories("", 1, 1000);
      setCategory(res.items);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
    fetchCategory();
  }, [fetchBooks, fetchCategory]);

  const handleDeleteBook = async () => {
    if (!selectedId) return;
    try {
      await bookService.removeBook(selectedId);
      toast.success(t("p.deleteSuccess"));
      fetchBooks();
    } catch (err) {
      console.error(err);
      toast.error(t("p.deleteError"));
    } finally {
      setOpenConfirm(false);
      setSelectedId(null);
    }
  };

  const columns: Column<Book>[] = [
    { key: "title", label: t("p.title") },
    { key: "author", label: t("p.author") },
    { key: "publisher", label: t("p.publisher") },
    {
      key: "category",
      label: t("p.category"),
      render: (book) =>
        Array.isArray(book.category)
          ? book.category.map((c) => c.name).join(", ")
          : "",
    },
    {
      key: "price",
      label: t("p.price"),
      render: (book) =>
        formatCurrency(
          book.variants?.find((v) => v.rarity === "common")?.price ?? 0
        ),
    },
    { key: "releaseYear", label: t("p.releaseYear") },
    {
      key: "stock",
      label: t("p.stock"),
      render: (book) => (
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            color="light"
            onClick={() => {
              setStockBook(book);
              setShowStockModal(true);
            }}
          >
            {t("i.detail")}
          </Button>
        </div>
      ),
    },
    {
      key: "actions",
      label: t("actions"),
      render: (book: Book) => (
        <div className="flex gap-1 sm:gap-2">
          <Button
            size="sm"
            color="blue"
            className="px-2 py-1 sm:px-3 sm:py-2"
            onClick={() => {
              setIsVariant(false);
              setSelectedBook(book);
              setDetailMode(true);
              setModalOpen(true);
            }}
          >
            <FaEye />
          </Button>

          <Button
            size="sm"
            color="purple"
            className="px-2 py-1 sm:px-3 sm:py-2"
            onClick={() => {
              setIsVariant(true);
              setSelectedBook(book);
              setDetailMode(false);
              setModalOpen(true);
            }}
          >
            <FaCube />
          </Button>

          <Button
            size="sm"
            color="yellow"
            className="px-2 py-1 sm:px-3 sm:py-2"
            onClick={() => {
              setIsVariant(false);
              setSelectedBook(book);
              setDetailMode(false);
              setModalOpen(true);
            }}
          >
            <FaPen />
          </Button>

          <Button
            size="sm"
            color="red"
            className="px-2 py-1 sm:px-3 sm:py-2"
            onClick={() => {
              setSelectedId(book._id!);
              setOpenConfirm(true);
            }}
          >
            <FaTrash />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb aria-label="breadcrumb" className="px-5 py-3">
        <BreadcrumbItem href="#" icon={HomeIcon}>
          Dashboard
        </BreadcrumbItem>
        <BreadcrumbItem href="#">{m("productManagement")}</BreadcrumbItem>
        <BreadcrumbItem>{m("book")}</BreadcrumbItem>
      </Breadcrumb>

      <div className="p-6 shadow rounded-2xl">
        {/* Header filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <TextInput
            type="text"
            placeholder={t("p.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={FaSearch}
            className="w-60"
          />

          {/* Filter release year */}
          <Datepicker
            placeholder={t("p.releaseYearPlaceholder")}
            // onSelectedDateChanged={(date) =>
            //   setReleaseYear(date.getFullYear().toString())
            // }
          />

          {/* Category */}
          <Dropdown
            inline={true}
            arrowIcon={false}
            label={
              <button className="w-60 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 flex justify-between items-center">
                {category.find((c) => c._id === categoryId)?.name ||
                  t("p.allCategories")}
                <FaChevronDown className="ml-2" />
              </button>
            }
            dismissOnClick
          >
            <DropdownItem onClick={() => setCategoryId("")}>
              {t("p.allCategories")}
            </DropdownItem>
            {category.map((c) => (
              <DropdownItem key={c._id} onClick={() => setCategoryId(c._id)}>
                {c.name}
              </DropdownItem>
            ))}
          </Dropdown>

          <Dropdown
            inline={true}
            arrowIcon={false}
            label={
              <button className="w-48 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 flex justify-between items-center">
                {priceRange || t("p.priceRange")}
                <FaChevronDown className="ml-2" />
              </button>
            }
            dismissOnClick
          >
            <DropdownItem onClick={() => setPriceRange("")}>
              {t("p.all")}
            </DropdownItem>
            <DropdownItem onClick={() => setPriceRange("0-50000")}>
              0 - 50.000
            </DropdownItem>
            <DropdownItem onClick={() => setPriceRange("50000-100000")}>
              50.000 - 100.000
            </DropdownItem>
            <DropdownItem onClick={() => setPriceRange("100000-200000")}>
              100.000 - 200.000
            </DropdownItem>
          </Dropdown>

          <div className="ml-auto flex gap-2">
            <Button
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => {
                setSelectedBook(null);
                setDetailMode(false);
                setModalOpen(true);
              }}
            >
              <FaPlus />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto max-w-[calc(100vw-300px)] rounded">
          <BaseTable columns={columns} data={books} />
          <ActionModal
            variantMode={isVariant}
            key={selectedBook?._id ?? "create"}
            isOpen={modalOpen}
            defaultValues={selectedBook ?? undefined}
            onClose={() => {
              fetchBooks();
              setModalOpen(false);
              setSelectedBook(null);
            }}
            mode={detailMode ? "detail" : selectedBook ? "edit" : "create"}
          />
          <Pagination
            currentPage={currentPage}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>

        {/* Confirm Modal */}
        <ConfirmModal
          show={openConfirm}
          onClose={() => setOpenConfirm(false)}
          type="error"
          title={t("p.deleteConfirmTitle")}
          message={t("p.deleteConfirmMessage")}
          onConfirm={handleDeleteBook}
        />
      </div>
      <StockDetailModal
        show={showStockModal}
        onClose={() => setShowStockModal(false)}
        book={stockBook}
      />
    </div>
  );
}
