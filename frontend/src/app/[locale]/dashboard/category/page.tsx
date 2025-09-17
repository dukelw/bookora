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

  // Confirm state
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories(search);
      setCategories(data);
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
          <Table hoverable={true}>
            <TableHead>
              <TableRow>
                <TableHeadCell>ID</TableHeadCell>
                <TableHeadCell>Tên danh mục</TableHeadCell>
                <TableHeadCell>Mô tả</TableHeadCell>
                <TableHeadCell>Độ tuổi</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {categories
                .filter((c) =>
                  c.name.toLowerCase().includes(search.toLowerCase())
                )
                .map((category, idx) => (
                  <TableRow key={idx} className="bg-white">
                    <TableCell className="font-medium text-gray-900">
                      {category._id}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {category.name}
                    </TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>{category.ageRange}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Button
                          size="xs"
                          color="yellow"
                          onClick={() => {
                            setEditingCategory(category);
                            setOpenCategoryModal(true);
                          }}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="xs"
                          color="red"
                          className="ml-2"
                          onClick={() => {
                            setSelectedId(category._id!);
                            setOpenConfirm(true); // 👈 mở confirm modal
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
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
