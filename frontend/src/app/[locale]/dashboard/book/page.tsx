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

export default function BookManagementPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Partial<Book> | null>(null);
  const [isVariant, setIsVariant] = useState<boolean>(false);

  const fetchData = async () => {
    const res = await bookService.getBooks();
    setBooks(res);
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
  }, []);

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
          <Table hoverable={true}>
            <TableHead>
              <TableRow>
                <TableHeadCell>Tên sách</TableHeadCell>
                <TableHeadCell>Tác giả</TableHeadCell>
                <TableHeadCell>NXB</TableHeadCell>
                <TableHeadCell>Danh mục</TableHeadCell>
                <TableHeadCell>Giá</TableHeadCell>
                <TableHeadCell>Năm</TableHeadCell>
                <TableHeadCell>Tồn kho</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {books.map((book, idx) => (
                <TableRow key={idx} className="bg-white">
                  <TableCell className="font-medium text-gray-900">
                    {book.title}
                  </TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.publisher}</TableCell>

                  {/* Category */}
                  <TableCell>
                    {Array.isArray(book.category)
                      ? book.category.map((c) => c.name).join(", ")
                      : book.category?.name}
                  </TableCell>

                  {/* Price */}
                  <TableCell>
                    {formatCurrency(
                      book.variants?.find((v) => v.rarity === "common")
                        ?.price ?? 0
                    )}
                  </TableCell>
                  <TableCell>{book.releaseYear}</TableCell>
                  <TableCell>{book.stock}</TableCell>

                  {/* Images */}
                  {/* <TableCell className="flex gap-1">
                  {book.images?.map((img) => (
                    <Image
                      width={20}
                      height={20}
                      key={img._id}
                      src={img.url}
                      alt={book.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ))}
                </TableCell> */}

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => setModalOpen(true)}
                        size="xs"
                        color="blue"
                      >
                        Chi tiết
                      </Button>
                      <Button
                        onClick={() => {
                          setIsVariant(true);
                          setSelectedBook(book);
                          setModalOpen(true);
                        }}
                        size="xs"
                        color="purple"
                      >
                        Biến thể
                      </Button>
                      <Button
                        onClick={() => {
                          setIsVariant(false);
                          setSelectedBook(book);
                          setModalOpen(true);
                        }}
                        size="xs"
                        color="yellow"
                        className="text-black"
                      >
                        Sửa
                      </Button>

                      <Button
                        onClick={() => handleDeleteBook(book._id)}
                        size="xs"
                        color="red"
                      >
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
          ></ActionModal>
        </div>
      </div>
    </div>
  );
}
