"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  ToggleSwitch,
} from "flowbite-react";
import { FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
import { Upload } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "use-intl";
import { uploadService } from "@/services/uploadService";

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

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: User) => Promise<void>;
  initialData?: User | null;
  mode: "edit" | "view";
}

export default function UserModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: UserModalProps) {
  const t = useTranslations("dashboard");

  const [formData, setFormData] = useState<User>({
    email: "",
    password: "",
    address: "",
    name: "",
    avatar: "",
    shippingAddress: "",
    role: "customer",
    status: "active",
  });

  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        password: "",
      });
    } else {
      setFormData({
        email: "",
        password: "",
        address: "",
        name: "",
        avatar: "",
        shippingAddress: "",
        role: "customer",
        status: "active",
      });
    }
    setFile(null);
  }, [initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const previewUrl = URL.createObjectURL(selected);
    setFormData((prev) => ({ ...prev, avatar: previewUrl }));
  };

  const handleToggleStatus = (val: boolean) => {
    setFormData((prev) => ({
      ...prev,
      status: val ? "active" : "disable",
    }));
  };

  const handleSubmit = async () => {
    if (!formData.email.trim()) {
      toast.warn(t("u.warnEmailRequired"));
      return;
    }
    setSaving(true);

    let avatarUrl = formData.avatar;
    if (file) {
      avatarUrl = await uploadService.uploadFile(file);
    }

    const payload = { ...formData, avatar: avatarUrl };
    if (!payload.password || payload.password.trim() === "") {
      delete payload.password;
    }

    await onSubmit(payload);
    setSaving(false);
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="3xl">
      <ModalHeader className="border-gray-200">
        {isEditMode ? t("u.editUser") : t("u.viewUser")}
      </ModalHeader>

      <ModalBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("u.email")}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled={isViewMode}
                onChange={handleChange}
                placeholder={t("u.emailPlaceholder")}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            {!isViewMode && (
              <>
                <div>
                  <div className={`flex items-center gap-2 ${showPasswordForm ? "mb-2" : ""}`}>
                    <input
                      id="changePassword"
                      type="checkbox"
                      checked={showPasswordForm}
                      onChange={(e) => {
                        setShowPasswordForm(e.target.checked);
                          if (!e.target.checked) {
                            setFormData((prev) => ({ ...prev, password: "" }));
                          }
                        }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label
                      htmlFor="changePassword"
                      className="text-md font-medium text-gray-700 cursor-pointer select-none"
                    >
                      {t("u.changePassword") || "Đổi mật khẩu"}
                    </label>
                  </div>

                  {(showPasswordForm) && (
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[55%] transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("u.name")}
              </label>
              <input
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                disabled={isViewMode}
                placeholder={t("u.namePlaceholder")}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("u.address")}
              </label>
              <input
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                disabled={isViewMode}
                placeholder={t("u.addressPlaceholder")}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("u.shippingAddress")}
              </label>
              <input
                name="shippingAddress"
                value={formData.shippingAddress || ""}
                onChange={handleChange}
                disabled={isViewMode}
                placeholder={t("u.shippingAddressPlaceholder")}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("u.avatar")}
              </label>
              <div className="flex items-center justify-center">
                {!formData.avatar ? (
                  !isViewMode && (
                    <div className="w-full border-2 border-dashed border-gray-300 rounded-md p-8">
                      <label className="w-full flex flex-col items-center justify-center cursor-pointer">
                        <Upload size={25} className="text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                          {t("u.uploadAvatar")}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )
                ) : (
                  <div className="relative w-lg-full h-48">
                    <img
                      src={formData.avatar}
                      alt="avatar"
                      className="w-lg-full h-48 object-cover rounded-lg border border-gray-300 shadow-sm mx-auto"
                    />
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, avatar: "" }))}
                        className="absolute -top-2 -right-2 bg-gray-600 text-white p-1 rounded-full shadow hover:bg-red-600"
                      >
                        <FaTrash size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("u.role")}
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                <option value="customer">{t("u.roleCustomer")}</option>
                <option value="admin">{t("u.roleAdmin")}</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("u.status")}
              </label>
              <ToggleSwitch
                id="status"
                checked={formData.status === "active"}
                onChange={handleToggleStatus}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="mt-4 flex justify-end gap-2 w-full">
        {!isViewMode && (
          <>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? <Spinner size="sm" /> : t("update")}
            </Button>
            <Button color="gray" onClick={onClose}>
              {t("cancel")}
            </Button>
          </>
        )}
        {isViewMode && (
          <Button color="gray" onClick={onClose}>
            {t("close")}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}