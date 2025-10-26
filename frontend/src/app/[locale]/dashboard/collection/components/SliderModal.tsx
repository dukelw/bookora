"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "flowbite-react";
import { toast } from "react-toastify";
import { useTranslations } from "use-intl";
import { uploadService } from "@/services/uploadService";

interface SliderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData: {
    title: string;
    image: string;
    description?: string;
    collection: string;
  };
}

export default function SliderModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: SliderModalProps) {
  const t = useTranslations("dashboard");

  const [formData, setFormData] = useState(initialData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(formData.image || "");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.warn(t("c.warnSubmit"));
      return;
    }

    let imageUrl = formData.image;
    try {
      if (imageFile) {
        setIsUploading(true);
        const res = await uploadService.uploadFile(imageFile);
        imageUrl = res;
      }
    } catch (error) {
      toast.error(t("c.uploadFail"));
      return;
    } finally {
      setIsUploading(false);
    }

    onSubmit({ ...formData, image: imageUrl });
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <ModalHeader className="border-gray-200">
        {initialData?.title ? t("c.editSlider") : t("c.createSlider")}
      </ModalHeader>

      <ModalBody>
        <div className="flex flex-col gap-6">
          {/* Tiêu đề */}
          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">
              {t("c.title")}
            </label>
            <input
              name="title"
              placeholder={t("c.enterTitle")}
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Upload ảnh */}
          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">
              {t("c.image")}
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="sliderImage"
              />
              <label
                htmlFor="sliderImage"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <span className="text-md text-gray-600">
                  {isUploading ? t("c.uploading") + "..." : t("c.selectImage")}
                </span>
              </label>

              {isUploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-md">
                  <Spinner size="xl" color="info" />
                </div>
              )}
            </div>

            {previewUrl && !isUploading && (
              <div className="mt-3 relative w-48 h-28">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl("");
                    setImageFile(null);
                    setFormData({ ...formData, image: "" });
                  }}
                  className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">
              {t("c.description")}
            </label>
            <input
              name="description"
              placeholder={t("c.enterDescription")}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="mt-4 flex justify-end gap-2 w-full">
        <Button onClick={handleSubmit} disabled={isUploading}>
          {isUploading ? (
            <>
              <Spinner size="sm" className="mr-2" /> {t("c.uploading")}
            </>
          ) : initialData?.title ? (
            t("update")
          ) : (
            t("create")
          )}
        </Button>
        <Button color="gray" onClick={onClose} disabled={isUploading}>
          {t("cancel")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
