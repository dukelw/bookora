/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from "flowbite-react";
import { toast } from "react-toastify";
import { useTranslations } from "use-intl";

interface Category {
  _id?: string;
  name: string;
  description?: string;
  ageRange?: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Category) => void;
  initialData?: Category | null; // khi sửa sẽ có data
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CategoryModalProps) {
  const t = useTranslations("dashboard");

  const [formData, setFormData] = useState<Category>({
    name: "",
    description: "",
    ageRange: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: "", description: "", ageRange: "" });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.warn(t("c.warnSubmit"));
      return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <ModalHeader className="border-gray-200">{initialData ? t("c.edit") : t("c.create")}</ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">{t("c.name")}</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder={t("c.enterName")}
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">{t("c.description")}</label>
            <input
              type="text"
              id="description"
              name="description"
              placeholder={t("c.enterDescription")}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">{t("c.ageRange")}</label>
            <input
              type="text"
              id="ageRange"
              name="ageRange"
              placeholder={t("c.enterAgeRange")}
              value={formData.ageRange}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </ModalBody>
      <ModalFooter className="mt-4 flex justify-end gap-2 w-full">
        <Button onClick={handleSubmit}>
          {initialData ? t("update") : t("create")}
        </Button>
        <Button color="gray" onClick={onClose}>
          {t("cancel")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
