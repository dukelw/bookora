"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeadCell,
  TableCell,
  TextInput,
  Select,
  Button,
  Datepicker,
  TableRow,
  Dropdown,
  DropdownItem,
  Breadcrumb,
  BreadcrumbItem,
} from "flowbite-react";
import { FaSearch, FaPlus } from "react-icons/fa";
import { formatCurrency } from "@/utils/format";
import ActionModal from "./components/ActionModal";
import { bookService } from "@/services/bookService";
import { Book } from "@/interfaces/Book";
import { toast } from "react-toastify";
import { HomeIcon } from "lucide-react";
import BaseTable, { Column } from "@/components/table/BaseTable";
import Pagination from "@/components/pagination/pagination";

export default function BookManagementPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Partial<Book> | null>(null);
  const [isVariant, setIsVariant] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const fetchData = async () => {
    try {
      const res = await bookService.getBooks(search, currentPage, pageSize);
      setBooks(res.items);
      setTotal(res.total);
    } catch (err) {
      toast.error("Lỗi khi tải dữ liệu sách");
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    const res = await bookService.removeBook(bookId);
    if (res) {
      toast.success("Xóa sách thành công");
    } else {
      toast.error("Có lỗi khi xóa sách");
    }
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [search, currentPage, pageSize]);

  const columns: Column<Book>[] = [
    { key: "title", label: "Tên sách" },
    { key: "author", label: "Tác giả" },
    { key: "publisher", label: "NXB" },
    {
      key: "category",
      label: "Danh mục",
      render: (book) =>
        Array.isArray(book.category)
          ? book.category.map((c) => c.name).join(", ")
          : "",
    },
    {
      key: "price",
      label: "Giá",
      render: (book) =>
        formatCurrency(
          book.variants?.find((v) => v.rarity === "common")?.price ?? 0
        ),
    },
    { key: "releaseYear", label: "Năm" },
    { key: "stock", label: "Tồn kho" },
    {
      key: "actions",
      label: "Actions",
      render: (book: Book) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setModalOpen(true)}
            className="h-8 px-2 text-white bg-blue-600 rounded text-xs hover:bg-blue-700 transition"
          >
            Chi tiết
          </button>

          <button
            onClick={() => {
              setIsVariant(true);
              setSelectedBook(book);
              setModalOpen(true);
            }}
            className="h-8 px-2 text-white bg-purple-600 rounded text-xs hover:bg-purple-700 transition"
          >
            Biến thể
          </button>

          <button
            onClick={() => {
              setIsVariant(false);
              setSelectedBook(book);
              setModalOpen(true);
            }}
            className="h-8 px-2 text-black bg-yellow-300 rounded text-xs hover:bg-yellow-400 transition"
          >
            Sửa
          </button>

          <button
            onClick={() => handleDeleteBook(book._id!)}
            className="h-8 px-2 text-white bg-red-600 rounded text-xs hover:bg-red-700 transition"
          >
            Xóa
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        aria-label="Solid background breadcrumb example"
        className="px-5 py-3"
      >
        <BreadcrumbItem href="#" icon={HomeIcon}>
          Dashboard
        </BreadcrumbItem>
        <BreadcrumbItem href="#">Book Management</BreadcrumbItem>
        <BreadcrumbItem>Book</BreadcrumbItem>
      </Breadcrumb>
      <div className="p-6">
        {/* Header filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <TextInput
            type="text"
            placeholder="Tìm kiếm theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={FaSearch}
            className="w-60"
          />

          {/* Filter release year */}
          <Datepicker
            placeholder="Năm phát hành"
            // onSelectedDateChanged={(date) =>
            //   setReleaseYear(date.getFullYear().toString())
            // }
          />

          {/* Category */}
          <Dropdown
            label={category ? category : "Tất cả danh mục"}
            dismissOnClick={true}
          >
            <DropdownItem onClick={() => setCategory("")}>
              Tất cả danh mục
            </DropdownItem>
            <DropdownItem onClick={() => setCategory("Fantasy")}>
              Fantasy
            </DropdownItem>
            <DropdownItem onClick={() => setCategory("Thiếu nhi")}>
              Thiếu nhi
            </DropdownItem>
          </Dropdown>

          {/* Price */}
          <Dropdown
            label={priceRange ? priceRange : "Khoảng giá"}
            dismissOnClick={true}
          >
            <DropdownItem onClick={() => setPriceRange("")}>
              Tất cả
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

          {/* Action buttons */}
          <div className="ml-auto flex gap-2">
            <Button
              color="green"
              onClick={() => {
                setSelectedBook(null);
                setModalOpen(true);
              }}
            >
              <FaPlus className="mr-2" /> Tạo sách
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-w-[calc(100vw-300px) rounded">
          <BaseTable columns={columns} data={books} />
          <ActionModal
            variantMode={isVariant}
            key={selectedBook?._id ?? "create"}
            isOpen={modalOpen}
            defaultValues={selectedBook ?? undefined}
            onClose={() => {
              fetchData();
              setModalOpen(false);
              setSelectedBook(null);
            }}
          />

          <Pagination
            currentPage={currentPage}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>
    </div>
  );
}
