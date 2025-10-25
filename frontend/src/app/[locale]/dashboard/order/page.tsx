"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Dropdown,
  DropdownItem,
} from "flowbite-react";
import { FaEye, FaEdit, FaChevronDown } from "react-icons/fa";
import { HomeIcon } from "@heroicons/react/24/solid";
import { orderService } from "@/services/orderService";
import BaseTable, { Column } from "@/components/table/BaseTable";
import Pagination from "@/components/pagination/pagination";
import ConfirmModal from "@/app/components/ui/modal/ConfirmModal";
import { toast } from "react-toastify";
import { useTranslations } from "use-intl";
import { formatCurrency } from "@/utils/format";
import OrderDetailModal from "./components/OrderDetailModal";
import { OrderStatus } from "@/enums";
import { userService } from "@/services/userService";
import { UserInfoCell } from "./components/UserInfoCell";

export default function OrderManagementPage() {
  const t = useTranslations("dashboard");

  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  const fetchOrders = useCallback(async () => {
    try {
      const res = await orderService.getAllOrders({
        page: currentPage,
        limit: pageSize,
        status: statusFilter,
      });
      setOrders(res.items || res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error(err);
      toast.error(t("errorLoad"));
    }
  }, [currentPage, pageSize, statusFilter, t]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleConfirmStatusChange = async () => {
    if (!selectedOrder || !newStatus) return;
    try {
      await orderService.updateOrderStatus(selectedOrder._id, newStatus);
      toast.success(t("p.updateSuccess"));
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error(t("p.updateFailed"));
    } finally {
      setOpenConfirm(false);
      setSelectedOrder(null);
      setNewStatus("");
    }
  };

  const columns: Column<any>[] = [
    { key: "_id", label: "Order ID" },
    {
      key: "user",
      label: "Người mua",
      render: (order) => <UserInfoCell userId={order.user} />,
    },
    {
      key: "totalAmount",
      label: t("p.totalAmount"),
      render: (order) => formatCurrency(order.finalAmount || 0),
    },
    {
      key: "status",
      label: t("p.status"),
      render: (order) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            order.status === "completed"
              ? "bg-green-100 text-green-700"
              : order.status === "cancelled"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {t(`p.${order.status}`)}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: t("p.createdAt"),
      render: (order) =>
        new Date(order.createdAt).toLocaleString("vi-VN", {
          hour12: false,
        }),
    },
    {
      key: "actions",
      label: t("actions"),
      render: (order) => (
        <div className="flex gap-2">
          <Button
            color="blue"
            size="sm"
            onClick={() => {
              setSelectedOrder(order);
              setShowDetail(true);
            }}
          >
            <FaEye />
          </Button>
          <Dropdown
            inline
            arrowIcon={false}
            label={
              <Button color="purple" size="sm">
                <FaEdit />
              </Button>
            }
            dismissOnClick
          >
            {Object.values(OrderStatus)
              .filter((s) => s !== order.status)
              .map((s) => (
                <DropdownItem
                  key={s}
                  onClick={() => {
                    setSelectedOrder(order);
                    setNewStatus(s);
                    setOpenConfirm(true);
                  }}
                >
                  {t(`p.${s}`)}
                </DropdownItem>
              ))}
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb aria-label="breadcrumb" className="px-5 py-3">
        <BreadcrumbItem href="#" icon={HomeIcon}>
          {t("p.dashboard")}
        </BreadcrumbItem>
        <BreadcrumbItem>{t("p.orderManagement")}</BreadcrumbItem>
      </Breadcrumb>

      <div className="p-6 shadow rounded-2xl">
        {/* Filter */}
        <div className="flex justify-between items-center mb-4">
          <Dropdown
            inline
            arrowIcon={false}
            label={
              <button className="w-48 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 flex justify-between items-center">
                {statusFilter ? t(`p.${statusFilter}`) : t("p.all")}
                <FaChevronDown className="ml-2" />
              </button>
            }
            dismissOnClick
          >
            <DropdownItem onClick={() => setStatusFilter("")}>
              {t("p.all")}
            </DropdownItem>

            {Object.values(OrderStatus).map((status) => (
              <DropdownItem
                key={status}
                onClick={() => setStatusFilter(status)}
              >
                {t(`p.${status}`)}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>

        <div className="overflow-x-auto rounded">
          <BaseTable columns={columns} data={orders} />
          <Pagination
            currentPage={currentPage}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>

        <OrderDetailModal
          show={showDetail}
          onClose={() => setShowDetail(false)}
          order={selectedOrder}
        />

        <ConfirmModal
          show={openConfirm}
          type="warning"
          title={t("p.statusConfirmTitle", { status: newStatus })}
          message={t("p.statusConfirmMessage", { status: newStatus })}
          onConfirm={handleConfirmStatusChange}
          onClose={() => setOpenConfirm(false)}
        />
      </div>
    </div>
  );
}
