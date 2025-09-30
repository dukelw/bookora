"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  TextInput,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  HomeIcon,
} from "flowbite-react";
import { FaSearch, FaPlus } from "react-icons/fa";
import CategoryModal from "./components/ActionModal";
import { categoryService } from "@/services/categoryService";
import ConfirmModal from "@/app/components/ui/modal/ConfirmModal";
import { toast } from "react-toastify";
import BaseTable from "@/components/table/BaseTable";
import Pagination from "@/components/pagination/pagination";
import { useTranslations } from "use-intl";

interface Category {
  _id?: string;
  name: string;
  description?: string;
  ageRange?: string;
}

export default function CategoryManagementPage() {
  const t = useTranslations("dashboard");
  const m = useTranslations("sidebar");

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [total, setTotal] = useState(0);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryService.getCategories(search, currentPage, pageSize);
      setCategories(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }, [search, currentPage, pageSize]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSaveCategory = async (data: Category) => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id!, data);
        toast.success(t("c.updateSuccess"));
      } else {
        await categoryService.createCategory(data);
        toast.success(t("c.createSuccess"));
      }
      await fetchCategories();
    } catch (err) {
      console.error("Error saving category:", err);
      toast.error(t("c.actionFailed"));
    } finally {
      setOpenCategoryModal(false);
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedId) return;
    try {
      await categoryService.removeCategory(selectedId);
      toast.success(t("c.deleteSuccess"));
      setCategories(prev => prev.filter(c => c._id !== selectedId));
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error(t("c.deleteFailed"));
    } finally {
      setOpenConfirm(false);
      setSelectedId(null);
    }
  };

  const columns = [
    { key: "_id", label: "ID" },
    { key: "name", label: t("c.name") },
    { key: "description", label: t("c.description") },
    { key: "ageRange", label: t("c.ageRange") },
    {
      key: "actions",
      label: t("actions"),
      render: (category: Category) => (
        <div className="flex items-center justify-between gap-2">
          <button
            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-xs transition"
            onClick={() => {
              setEditingCategory(category);
              setOpenCategoryModal(true);
            }}
          >
            {t("edit")}
          </button>
          <button
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs transition"
            onClick={() => {
              setSelectedId(category._id!);
              setOpenConfirm(true);
            }}
          >
            {t("delete")}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb aria-label="Solid background breadcrumb example" className="px-5 py-3">
        <BreadcrumbItem href="#" icon={HomeIcon}>Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="#">{m("productManagement")}</BreadcrumbItem>
        <BreadcrumbItem>{m("categoryManagement")}</BreadcrumbItem>
      </Breadcrumb>

      <div className="p-6 shadow rounded-2xl">
        {/* Header filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <TextInput
            type="text"
            placeholder={t("c.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={FaSearch}
            className="w-60"
          />
          <div className="ml-auto flex gap-2">
            <Button
              color="green"
              onClick={() => {
                setEditingCategory(null);
                setOpenCategoryModal(true);
              }}
            >
              <FaPlus className="mr-2" /> {t("c.create")}
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
          title={t("c.deleteConfirmTitle")}
          message={t("c.deleteConfirmMessage")}
          onConfirm={handleDeleteCategory}
        />
      </div>
    </div>
  );
}
