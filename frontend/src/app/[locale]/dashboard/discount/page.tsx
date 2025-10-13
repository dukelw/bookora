"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TextInput,
  Button,
  Dropdown,
  DropdownItem,
  Breadcrumb,
  BreadcrumbItem,
  HomeIcon,
  ToggleSwitch,
} from "flowbite-react";
import { FaSearch, FaPen, FaEye, FaChevronDown, FaTrash, FaPlus } from "react-icons/fa";
import DiscountModal from "./components/ActionModal";
import { discountService } from "@/services/discountService";
import ConfirmModal from "@/app/components/ui/modal/ConfirmModal";
import { toast } from "react-toastify";
import BaseTable from "@/components/table/BaseTable";
import Pagination from "@/components/pagination/pagination";
import { useTranslations } from "use-intl";

export interface Discount {
  _id?: string;
  code: string;
  value: number;
  type: 'percentage' | 'amount';
  usageLimit: number;
  active?: boolean;
}

export default function DiscountManagementPage() {
    const t = useTranslations("dashboard");
    const m = useTranslations("sidebar");

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("")
    const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
    const [mode, setMode] = useState<"create" | "edit" | "view">("create");
    
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [editing, setEditing] = useState<Discount | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);
    const [total, setTotal] = useState(0);

    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const fetchDiscounts = useCallback(async () => {
        try {
            const res = await discountService.getAll(
                search,
                currentPage,
                pageSize,
                activeFilter === null ? undefined : activeFilter,
                typeFilter === "all" ? undefined : typeFilter,
            );
            setDiscounts(res.discounts || []);
            setTotal(res.total);
        } catch (err) {
            console.error(err);
            toast.error(t("d.actionFailed"));
        }
    }, [search, currentPage, pageSize, activeFilter, typeFilter, t]);

    useEffect(() => {
        fetchDiscounts();
    }, [fetchDiscounts]);

    const handleSaveDiscount = async (data: Partial<Discount>) => {
        console.log(data);
        try {
            if (editing) {
                await discountService.update(editing._id!, data);
                toast.success(t("d.updateSuccess"));
            } else {
            await discountService.create(data as Discount);
                toast.success(t("d.createSuccess"));
            }
            await fetchDiscounts();
        } catch (err: any) {
            if (err.response?.status === 400 && err.response?.data?.message?.includes('exists')) {
                toast.error(err.response?.data?.message);
            } else {
                toast.error(t("d.actionFailed"));
            }
        } finally {
            setOpenModal(false);
            setEditing(null);
        }
    };

    const handleChangeStatus = async (discount: Discount, newStatus: boolean) => {
        try {
            await discountService.toggleStatus(discount._id!, { active: newStatus });
            toast.success(
                newStatus === true ? t("d.statusActivated") : t("d.statusDisabled")
            );
            await fetchDiscounts();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response.data.message || t("d.actionFailed"));
        }
    };

    const handleDeleteDiscount = async () => {
        if (!selectedId) return;
        try {
            await discountService.remove(selectedId);
            toast.success(t("d.deleteSuccess"));
            setDiscounts(prev => prev.filter(c => c._id !== selectedId));
        } catch (err: any) {
            if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error(t("d.deleteFailed"));
            }
        } finally {
            setOpenConfirm(false);
            setSelectedId(null);
        }
    };

    const columns = [
        {
            key: "active",
            label: t("d.active"),
            render: (d: Discount) => (
                <div className="flex justify-center">
                <ToggleSwitch
                    id={`active-${d._id}`}
                    checked={!!d.active}
                    onChange={(checked) => handleChangeStatus(d, checked)}
                />
                </div>
            ),
        },
        { key: "code", label: t("d.code") },
        {
            key: "value",
            label: t("d.value"),
            render: (d: Discount) => {
                if (d.type === "percentage") {
                return `${d.value}%`;
                } else {
                const formattedValue = d.value.toLocaleString("vi-VN");
                return `${formattedValue} VND`;
                }
            },
        },
        { key: "usageLimit", label: t("d.usageLimit") },
        { key: "usedCount", label: t("d.usedCount") },
        {
            key: "actions",
            label: "Actions",
            render: (d: Discount) => (
                <div className="flex gap-1">
                <Button size="sm" color="blue" onClick={() => { setEditing(d); setOpenModal(true); setMode("view"); }}>
                    <FaEye />
                </Button>
                <Button size="sm" color="yellow" onClick={() => { setEditing(d); setOpenModal(true); setMode("edit"); }}>
                    <FaPen />
                </Button>
                <Button size="sm" color="red" className="px-2 py-1 sm:px-3 sm:py-2"
                    onClick={() => {
                      setSelectedId(d._id!);
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
                <BreadcrumbItem href="#" icon={HomeIcon}>Dashboard</BreadcrumbItem>
                <BreadcrumbItem>{m("discountManagement")}</BreadcrumbItem>
            </Breadcrumb>

            <div className="p-6 shadow rounded-2xl">
                {/* Header filters */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <TextInput
                        type="text"
                        placeholder={t("d.searchPlaceholder")}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        icon={FaSearch}
                        className="w-64"
                    />

                    <Dropdown
                        inline
                        arrowIcon={false}
                        label={
                        <div className="px-4 py-2.5 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 flex justify-between items-center cursor-pointer">
                            <span className="text-sm">{activeFilter === true ? t("d.active") : activeFilter === false ? t("d.inactive") : t("d.allStatus")}</span>
                            <FaChevronDown className="ml-2" />
                        </div>
                        }
                        dismissOnClick
                    >
                        <DropdownItem className="py-2 px-4" onClick={() => setActiveFilter(null)}>{t("d.allStatus")}</DropdownItem>
                        <DropdownItem className="py-2 px-4" onClick={() => setActiveFilter(true)}>{t("d.active")}</DropdownItem>
                        <DropdownItem className="py-2 px-4" onClick={() => setActiveFilter(false)}>{t("d.inactive")}</DropdownItem>
                    </Dropdown>

                    <Dropdown
                        inline
                        arrowIcon={false}
                        label={
                        <div className="px-4 py-2.5 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 flex justify-between items-center cursor-pointer"> 
                            <span className="text-sm">{typeFilter === "percentage" ? t("d.typePercentage") : typeFilter === "amount" ? t("d.typeAmount") : t("d.allType")}</span>
                            <FaChevronDown className="ml-2" />
                        </div>
                        }
                        dismissOnClick
                    >
                        <DropdownItem className="py-2 px-4" onClick={() => setTypeFilter("")}>{t("d.allType")}</DropdownItem>
                        <DropdownItem className="py-2 px-4" onClick={() => setTypeFilter("percentage")}>{t("d.typePercentage")}</DropdownItem>
                        <DropdownItem className="py-2 px-4" onClick={() => setTypeFilter("amount")}>{t("d.typeAmount")}</DropdownItem>
                    </Dropdown>

                    <div className="ml-auto flex gap-2">
                        <Button
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow"
                            onClick={() => {
                                setEditing(null);
                                setMode("create");
                                setOpenModal(true);
                            }}
                            >
                            <FaPlus />
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <BaseTable columns={columns} data={discounts} />
                </div>

                {/* Pagination */}
                <div className="mt-4 overflow-x-auto">
                    <Pagination
                        totalItems={total}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                    />
                </div>

                {/* Modal */}
                <DiscountModal
                    isOpen={openModal}
                    onClose={() => { setOpenModal(false); setEditing(null); }}
                    onSubmit={handleSaveDiscount}
                    initialData={editing}
                    mode={mode}
                />

                {/* Confirm Modal */}
                <ConfirmModal
                    show={openConfirm}
                    onClose={() => setOpenConfirm(false)}
                    type="error"
                    title={t("c.deleteConfirmTitle")}
                    message={t("c.deleteConfirmMessage")}
                    onConfirm={handleDeleteDiscount}
                />
            </div>
        </div>
    );
}
