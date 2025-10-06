import { useState, useEffect, useRef } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner, ToggleSwitch } from "flowbite-react";
import { toast } from "react-toastify";
import { useTranslations } from "use-intl";
import { uploadService } from "@/services/uploadService";
import { FaTrash } from "react-icons/fa";
import { Upload } from "lucide-react";

interface FooterImage {
  _id?: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  isActive?: boolean;
  order?: number;
}

interface FooterImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FooterImage) => Promise<void>;
  initialData?: FooterImage | null;
  mode: "add" | "edit" | "view";
  activeCount: number;
  prevOrder?: number;
}

export default function FooterImageModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  activeCount,
  prevOrder
}: FooterImageModalProps) {
  const prevOrderRef = useRef<number>(prevOrder ?? 0);
  const t = useTranslations("dashboard");
  const [formData, setFormData] = useState<FooterImage>({
    title: "",
    description: "",
    image: "",
    link: "",
    isActive: false,
    order: 0,
  });

  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData?.order) {
      setFormData(initialData);
      if (initialData.isActive && initialData.order) {
        prevOrderRef.current = initialData.order;
      } else {
        prevOrderRef.current = 0;
      }
    } else {
      setFormData({
        title: "",
        description: "",
        image: "",
        link: "",
        isActive: false,
        order: 0,
      });
      prevOrderRef.current = 0;
    }
    setFile(null);
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const previewUrl = URL.createObjectURL(selectedFile);
    setFormData((prev) => ({ ...prev, image: previewUrl }));
  };

  const handleToggleActive = (val: boolean) => {
  setFormData((prev) => {
      const updated = { ...prev };
      if (val) {
        updated.isActive = true;
        updated.order = prevOrderRef.current > 0 ? prevOrderRef.current : activeCount + 1;
      } else {
        updated.isActive = false;
        prevOrderRef.current = prev.order ?? 0;
        updated.order = 0;
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.warn(t("f.warnTitleRequired"));
      return;
    }
    if (!file && !formData.image) {
      toast.warn(t("f.warnImageRequired"));
      return;
    }

    setSaving(true);

    let imageUrl = formData.image;
    if (file) {
      imageUrl = await uploadService.uploadFile(file);
    }

    const payload: FooterImage = {
      ...formData,
      image: imageUrl,
    };

    await onSubmit(payload); 
    setSaving(false);
    onClose();
  };


  const isViewMode = mode === "view";

  return (
    <Modal show={isOpen} onClose={onClose} size="3xl">
      <ModalHeader className="border-gray-200">
        {mode === "add"
          ? t("f.create")
          : mode === "edit"
          ? t("f.edit")
          : t("f.detail")}
      </ModalHeader>

      <ModalBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("f.title")} *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={isViewMode}
                placeholder="Enter title"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("f.description")}
              </label>
              <textarea
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isViewMode}
                placeholder="Enter description"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("f.link")}
              </label>
              <input
                type="text"
                name="link"
                value={formData.link}
                onChange={handleChange}
                disabled={isViewMode}
                placeholder="https://example.com"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            {formData.isActive && (
              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">{t("f.order")}</label>
                <input
                  name="order"
                  type="number"
                  value={formData.order}
                  disabled
                  readOnly
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
              />
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("f.image")} *
              </label>
              <div className="flex items-center gap-4 justify-center">
                {!formData.image ? (
                  !isViewMode && (
                    <div className="w-full border-2 border-dashed border-gray-300 rounded-md p-9">
                      <label className="w-full flex flex-col items-center justify-center cursor-pointer">
                        <Upload size={25} className="text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                          Click to select images...
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
                      src={formData.image}
                      alt="preview"
                      className="w-lg-full h-48 object-cover rounded-lg border border-gray-300 shadow-sm mx-auto"
                    />
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, image: "" }))
                        }
                        className="absolute -top-2 -right-2 bg-gray-600 text-white p-1 rounded-full shadow hover:bg-red-600"
                      >
                        <FaTrash size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label>{t("f.isActive")}</label>
              <ToggleSwitch
                id="isActive"
                checked={!!formData.isActive}
                onChange={handleToggleActive}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="mt-4 flex justify-end gap-2 w-full">
        {!isViewMode ? (
          <>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <Spinner size="sm" />
              ) : initialData ? (
                t("update")
              ) : (
                t("create")
              )}
            </Button>
            <Button color="gray" onClick={onClose}>
              {t("cancel")}
            </Button>
          </>
        ) : (
          <Button color="gray" onClick={onClose}>
            {t("close")}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}