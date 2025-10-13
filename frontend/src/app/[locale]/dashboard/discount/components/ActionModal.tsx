"use client";

import { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, ToggleSwitch, Spinner } from "flowbite-react";
import { useTranslations } from "use-intl";
import { toast } from "react-toastify";

interface Discount {
  _id?: string;
  code: string;
  value: number;
  type: 'percentage' | 'amount';
  usageLimit: number;
  active?: boolean;
}

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Discount>) => void;
  initialData: Discount | null;
  mode: "create" | "edit" | "view";
}

export default function DiscountModal({ isOpen, onClose, onSubmit, initialData, mode }: DiscountModalProps) {
  const t = useTranslations("dashboard");

  const [formData, setFormData] = useState<Discount>({
    code: "",
    value: 0,
    type: "percentage",
    usageLimit: 0,
    active: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        code: initialData.code,
        type: initialData.type,
        value: initialData.value,
        usageLimit: initialData.usageLimit,
        active: initialData.active ?? false,
      });
    } else {
      setFormData({
        code: "",
        type: "percentage",
        value: 0,
        usageLimit: 0,
        active: false,
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value
    }));
  };

  const handleSubmit = async () => {
    if ((mode === "create") && (!formData.code.trim())) {
      toast.warn(t("d.warnCodeRequired"));
      return;
    }

    if ((mode === "create") && (formData.code.trim() && formData.code.length !== 5)) {
      toast.warn(t("d.warnCodeLengthRequired"));
      return;
    }

    if (formData.type === "percentage" && (formData.value <= 0 || formData.value > 100)) {
      toast.warn(t("d.warnValuePercentage"));
      return;
    }

    if (formData.type === "amount" && formData.value < 1000) {
      toast.warn(t("d.warnValueAmount"));
      return;
    }

    if (formData.usageLimit <= 0 || formData.usageLimit > 10) {
      toast.warn(t("d.warnUsageLimitRequired"));
      return;
    }

    setSaving(true);
    try {
      if (mode === "edit") {
        await onSubmit({ value: formData.value, usageLimit: formData.usageLimit });
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(t("d.actionFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={isOpen} size="md" onClose={onClose}>
      <ModalHeader className="border-gray-200">
        {mode === "create" ? t("d.create") : mode === "edit" ? t("d.edit") : t("d.detail")}
      </ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">{t("d.code")}</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              disabled={mode !== "create"}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${mode !== "create" ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">{t("d.type")}</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={mode !== "create"}
              className={`w-full px-4 py-[3%] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${mode !== "create" ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
            >
              <option value="percentage">{t("d.typePercentage")}</option>
              <option value="amount">{t("d.typeAmount")}</option>
            </select>
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">{t("d.value")}</label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleChange}
              disabled={mode === "view"}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">{t("d.usageLimit")}</label>
            <input
              type="number"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleChange}
              disabled={mode === "view"}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
          </div>

          {(mode === "create" || mode === "view") && (
            <div className="flex items-center justify-between">
              <label className="block text-md font-medium text-gray-700 mb-2">{t("d.active")}</label>
              <ToggleSwitch
                id="active"
                checked={!!formData.active}
                onChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                disabled={mode === "view"}
              />
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter className="mt-4 flex justify-end gap-2 w-full">
        {mode !== "view" ? (
          <>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? <Spinner size="sm" /> : mode === "edit" ? t("update") : t("create")}
            </Button>
            <Button color="gray" onClick={onClose}>{t("cancel")}</Button>
          </>
        ) : (
          <Button color="gray" onClick={onClose}>{t("close")}</Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
