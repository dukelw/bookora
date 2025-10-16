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
} from "flowbite-react";
import { FaSearch, FaPen, FaEye, FaChevronDown } from "react-icons/fa";
import UserModal from "./components/ActionModal";
import { userService } from "@/services/userService";
import { toast } from "react-toastify";
import BaseTable from "@/components/table/BaseTable";
import Pagination from "@/components/pagination/pagination";
import { useTranslations } from "use-intl";

interface User {
  _id?: string;
  email: string;
  password?: string;
  address?: string;
  name?: string;
  avatar?: string;
  shippingAddress?: string;
  role: "admin" | "customer";
  status: "active" | "disable";
}

export default function UserManagementPage() {
  const t = useTranslations("dashboard");
  const m = useTranslations("sidebar");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [mode, setMode] = useState<"edit" | "view">("view");

  const [users, setUsers] = useState<User[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await userService.getUsers(
        search,
        currentPage,
        pageSize,
        statusFilter === "all" ? undefined : statusFilter,
        roleFilter === "all" ? undefined : roleFilter
      );
      setUsers(res.users);
      setTotal(res.total);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error(t("c.actionFailed"));
    }
  }, [search, currentPage, pageSize, statusFilter, roleFilter, t]);


  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSaveUser = async (data: User) => {
    try {
      if (!editing) return;
      await userService.updateUser(editing._id!, data);
      toast.success(t("c.updateSuccess"));
      await fetchUsers();

    } catch (err) {
      console.error("Error saving user:", err);
      toast.error(t("c.actionFailed"));
    } finally {
      setOpenModal(false);
      setEditing(null);
    }
  };

  const handleChangeStatus = async (user: User, p0: string) => {
    const newStatus = user.status === "active" ? "disable" : "active";

    try {
      await userService.updateStatus(user._id!, { status: newStatus });
      toast.success(
        newStatus === "active" ? t("u.statusActivated") : t("u.statusDisabled")
      );
      await fetchUsers();
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(t("c.actionFailed"));
    }
  };

  const columns = [
    { key: "name", label: t("u.name") },
    {
      key: "image",
      label: t("u.avatar"),
      render: (user: User) => (
        <img
          src={user.avatar || "/default-avatar.png"}
          alt={user.name}
          className="w-50 h-auto rounded-circle object-cover non-border"
        />
      ),
    },
    { key: "email", label: t("u.email") },
    {
      key: "role",
      label: t("u.role"),
      render: (user: User) => (
        <span
          className={`px-2 py-1 rounded-lg text-sm ${
            user.role === "admin"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {user.role === "admin" ? t("u.roleAdmin") : t("u.roleCustomer")}
        </span>
      ),
    },
    {
      key: "status",
      label: t("u.status"),
      render: (user: User) => (
        <Dropdown
          inline
          arrowIcon={false}
          label={
            <span
              className={`px-3 py-1 rounded-lg text-sm font-medium cursor-pointer ${
                user.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {user.status === "active" ? t("u.active") : t("u.disable")}
            </span>
          }
        >
          {user.status !== "active" && (
            <DropdownItem onClick={() => handleChangeStatus(user, "active")}>
              {t("u.active")}
            </DropdownItem>
          )}
          {user.status !== "disable" && (
            <DropdownItem onClick={() => handleChangeStatus(user, "disable")}>
              {t("u.disable")}
            </DropdownItem>
          )}
        </Dropdown>
      ),
    },
    {
      key: "actions",
      label: t("actions"),
      render: (user: User) => (
        <div className="flex gap-1 sm:gap-2">
          <Button
            size="sm"
            color="blue"
            onClick={() => {
              setEditing(user);
              setOpenModal(true);
              setMode("view");
            }}
          >
            <FaEye />
          </Button>

          <Button
            size="sm"
            color="yellow"
            onClick={() => {
              setEditing(user);
              setOpenModal(true);
              setMode("edit");
            }}
          >
            <FaPen />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb aria-label="breadcrumb" className="px-5 py-3">
        <BreadcrumbItem href="#" icon={HomeIcon}>Dashboard</BreadcrumbItem>
        <BreadcrumbItem>{m("userManagement")}</BreadcrumbItem>
      </Breadcrumb>

      <div className="p-6 shadow rounded-2xl">
        {/* Header filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <TextInput
            type="text"
            placeholder={t("u.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={FaSearch}
            className="w-100"
          />

          {/* Role filters */}
          <Dropdown
            inline
            arrowIcon={false}
            label={
              <div className="w-48 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 flex justify-between items-center cursor-pointer"> 
                <span className="text-sm">{roleFilter === "admin" ? t("u.roleAdmin") : roleFilter === "customer" ? t("u.roleCustomer") : t("u.allRoles")}</span>
                <FaChevronDown className="ml-2" />
              </div>
            }
            dismissOnClick
          >
            <DropdownItem onClick={() => setRoleFilter("")}>{t("u.allRoles")}</DropdownItem>
            <DropdownItem onClick={() => setRoleFilter("admin")}>{t("u.roleAdmin")}</DropdownItem>
            <DropdownItem onClick={() => setRoleFilter("customer")}>{t("u.roleCustomer")}</DropdownItem>
          </Dropdown>

          {/* Status filters */}
          <Dropdown
            inline
            arrowIcon={false}
            label={
              <div className="w-48 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 flex justify-between items-center cursor-pointer"> 
              <span className="text-sm">{statusFilter === "active" ? t("u.active"): statusFilter === "disable" ? t("u.disable"): t("u.allStatus")}</span>
                <FaChevronDown className="ml-2" />
              </div>
            }
            dismissOnClick
          >
            <DropdownItem onClick={() => setStatusFilter("")}>{t("u.allStatus")}</DropdownItem>
            <DropdownItem onClick={() => setStatusFilter("active")}>{t("u.active")}</DropdownItem>
            <DropdownItem onClick={() => setStatusFilter("disable")}>{t("u.disable")}</DropdownItem>
          </Dropdown>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <BaseTable columns={columns} data={users} />
        </div>

        <div className="mt-4 overflow-x-auto">
          <Pagination
            totalItems={total}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>

        {/* User Modal */}
        <UserModal
          isOpen={openModal}
          onClose={() => { setOpenModal(false); setEditing(null); }}
          onSubmit={handleSaveUser}
          initialData={editing}
          mode={mode}
        />
      </div>
    </div>
  );
}
