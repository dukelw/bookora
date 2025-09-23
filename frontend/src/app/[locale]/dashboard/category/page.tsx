"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeadCell,
  TableCell,
  TextInput,
  Button,
  TableRow,
  Breadcrumb,
  BreadcrumbItem,
  HomeIcon,
} from "flowbite-react";
import { FaSearch, FaPlus } from "react-icons/fa";
import CategoryModal from "./components/ActionModal";
import { categoryService } from "@/services/categoryService";
import ConfirmModal from "@/app/components/ui/modal/ConfirmModal";
import { toast } from "react-toastify";
import { isSuccessMessage } from "@/utils/check";
import BaseTable from "@/components/table/BaseTable";
import Pagination from "@/components/pagination/pagination";

interface Category {
  _id?: string;
  name: string;
  description?: string;
  ageRange?: string;
}

export default function CategoryManagementPage() {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [total, setTotal] = useState(0);

  // Confirm state
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Gọi lại API mỗi khi search, currentPage, pageSize đổi
  useEffect(() => {
    fetchCategories();
  }, [search, currentPage, pageSize]);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories(
        search,
        currentPage,
        pageSize
      );
      setCategories(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search]);

  const handleSaveCategory = async (data: Category) => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id!, data);
      } else {
        await categoryService.createCategory(data);
      }
      await fetchCategories();
    } catch (err) {
      console.error("Error saving category:", err);
    } finally {
      setOpenCategoryModal(false);
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedId) return;
    try {
      const res = await categoryService.removeCategory(selectedId);
      if (isSuccessMessage(res.message)) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }

      setCategories(categories.filter((c) => c._id !== selectedId));
    } catch (err) {
      console.error("Error deleting category:", err);
    } finally {
      setOpenConfirm(false);
      setSelectedId(null);
    }
  };

  const columns = [
    { key: "_id", label: "ID" },
    { key: "name", label: "Tên danh mục" },
    { key: "description", label: "Mô tả" },
    { key: "ageRange", label: "Độ tuổi" },
    {
      key: "actions",
      label: "Actions",
      render: (category: Category) => (
        <div className="flex items-center justify-between gap-2">
          <button
            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-xs transition"
            onClick={() => {
              setEditingCategory(category);
              setOpenCategoryModal(true);
            }}
          >
            Sửa
          </button>
          <button
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs transition"
            onClick={() => {
              setSelectedId(category._id!);
              setOpenConfirm(true);
            }}
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
        <BreadcrumbItem>Category</BreadcrumbItem>
      </Breadcrumb>
      <div className="p-6 shadow rounded-2xl">
        {/* Header filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <TextInput
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={FaSearch}
            className="w-60"
          />

          <div className="ml-auto flex gap-2">
            <Button
              color="purple"
              onClick={() => {
                setEditingCategory(null);
                setOpenCategoryModal(true);
              }}
            >
              <FaPlus className="mr-2" /> Tạo danh mục
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <BaseTable columns={columns} data={categories} />
        </div>
        <div className="mt-4">
          <Pagination
            totalItems={total}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>

        {/* Category Modal */}
        <CategoryModal
          isOpen={openCategoryModal}
          onClose={() => {
            setOpenCategoryModal(false);
            setEditingCategory(null);
          }}
          onSubmit={handleSaveCategory}
          initialData={editingCategory}
        />

        {/* Confirm Modal */}
        <ConfirmModal
          show={openConfirm}
          onClose={() => setOpenConfirm(false)}
          type="error"
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa danh mục này không?"
          onConfirm={handleDeleteCategory}
        />
      </div>
    </div>
  );
}
