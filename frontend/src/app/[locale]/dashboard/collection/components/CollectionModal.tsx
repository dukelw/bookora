"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "flowbite-react";
import { toast } from "react-toastify";
import { useTranslations } from "use-intl";

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
  initialData?: { name: string } | null;
}

export default function CollectionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CollectionModalProps) {
  const t = useTranslations("dashboard");
  const [name, setName] = useState("");

  useEffect(() => {
    if (initialData) setName(initialData.name);
    else setName("");
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.warn(t("c.warnSubmit"));
      return;
    }
    onSubmit({ name });
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <ModalHeader className="border-gray-200">
        {initialData ? t("c.editCollection") : t("c.createCollection")}
      </ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">
              {t("c.collectionName")}
            </label>
            <input
              type="text"
              placeholder={t("c.enterCollectionName")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
