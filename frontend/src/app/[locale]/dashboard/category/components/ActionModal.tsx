/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
  TextInput,
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
    <Modal show={isOpen} onClose={onClose} size="md" popup>
      <ModalHeader>
        <p className="p-3">
          {initialData ? t("c.edit") : t("c.create")}
        </p>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <Label>{t("c.name")}</Label>
            <TextInput
              id="name"
              name="name"
              placeholder={t("c.enterName")}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>{t("c.description")}</Label>
            <TextInput
              id="description"
              name="description"
              placeholder={t("c.enterDescription")}
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>{t("c.ageRange")}</Label>
            <TextInput
              id="ageRange"
              name="ageRange"
              placeholder={t("c.enterAgeRange")}
              value={formData.ageRange}
              onChange={handleChange}
            />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
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
