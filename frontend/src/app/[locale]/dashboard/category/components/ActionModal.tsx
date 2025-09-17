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
      alert("Tên danh mục là bắt buộc!");
      return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="md" popup>
      <ModalHeader>
        <p className="p-3">
          {initialData ? "Sửa danh mục" : "Tạo danh mục mới"}
        </p>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <Label>Tên danh mục</Label>
            <TextInput
              id="name"
              name="name"
              placeholder="Nhập tên..."
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Mô tả</Label>
            <TextInput
              id="description"
              name="description"
              placeholder="Nhập mô tả..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Độ tuổi</Label>
            <TextInput
              id="ageRange"
              name="ageRange"
              placeholder='Ví dụ: "6-12", "18+"'
              value={formData.ageRange}
              onChange={handleChange}
            />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={handleSubmit}>
          {initialData ? "Cập nhật" : "Tạo mới"}
        </Button>
        <Button color="gray" onClick={onClose}>
          Hủy
        </Button>
      </ModalFooter>
    </Modal>
  );
}
