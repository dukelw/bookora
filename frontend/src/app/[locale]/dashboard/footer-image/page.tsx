"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button, Breadcrumb, BreadcrumbItem, HomeIcon, ToggleSwitch, Dropdown, DropdownItem, } from "flowbite-react";
import { FaPlus, FaPen, FaTrash, FaChevronDown } from "react-icons/fa";
import FooterImageModal from "./components/ActionModal";
import { footerImageService } from "@/services/footerImageService";
import ConfirmModal from "@/app/components/ui/modal/ConfirmModal";
import { toast } from "react-toastify";
import { useTranslations } from "use-intl";
import Image from "next/image";

interface FooterImage {
  _id?: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  isActive?: boolean;
  order?: number;
}

export default function FooterImageManagementPage() {
  const prevOrderRef = useRef<number>(0);

  const t = useTranslations("dashboard");
  const m = useTranslations("sidebar");

  const [images, setImages] = useState<FooterImage[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<FooterImage | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [mode, setMode] = useState<"add" | "edit" | "view">("add");
  const [sortStatus, setSortStatus] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const options = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Non-Active", value: "inactive" },
  ];

  const fetchImages = useCallback(async () => {
    try {
      const res = await footerImageService.findAll();
      setImages(res);
    } catch (err) {
      console.error("Error fetching footer images:", err);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const reorderActiveImages = async () => {
    try {
      const res = await footerImageService.getActive();
      const activeImages = res
        .filter((img: FooterImage) => img.isActive)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      for (let i = 0; i < activeImages.length; i++) {
        const img = activeImages[i];
        if (img.order !== i + 1) {
          await footerImageService.update(img._id!, { order: i + 1 });
        }
      }
      await fetchImages();
    } catch (err) {
      console.error("Failed to reorder active images", err);
    }
  };

  const handleSave = async (data: FooterImage) => {
    try {
      if (editing) {
        await footerImageService.update(editing._id!, data);
        toast.success(t("f.updateSuccess"));
        await reorderActiveImages();
      } else {
        await footerImageService.create(data);
        toast.success(t("f.createSuccess"));
      }
      await fetchImages();
    } catch (err) {
      console.error("Error saving footer image:", err);
      toast.error(t("f.actionFailed"));
    } finally {
      setOpenModal(false);
      setEditing(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await footerImageService.remove(selectedId);
      toast.success(t("f.deleteSuccess"));
      await reorderActiveImages();
    } catch (err) {
      console.error("Error deleting footer image:", err);
      toast.error(t("f.deleteFailed"));
    } finally {
      setOpenConfirm(false);
      setSelectedId(null);
    }
  };

  const handleActiveStatus = async (img: FooterImage, val: boolean) => {
    try {
      const activeImages = images.filter((i) => i.isActive);
      const current = images.find((i) => i._id === img._id);
      if (!current) return;

      if (val) {
        const nextOrder = activeImages.length > 0 ? Math.max(...activeImages.map((i) => i.order ?? 0)) + 1: 1;
        await footerImageService.update(img._id!, { isActive: true, order: nextOrder, });
        toast.success(t("f.active") + ` (${nextOrder})`);
      } else {
        await footerImageService.update(img._id!, { isActive: false, order: 0 });
        await reorderActiveImages();
        toast.success(t("f.active"));
      }

      await fetchImages();
    } catch (err) {
      console.error("Failed to update active status:", err);
      toast.error(t("f.errorActive"));
    }
  };
  

  const filteredImages = images.filter(img => {
    if (sortStatus === "active") return img.isActive;
    if (sortStatus === "inactive") return !img.isActive;
    return true;
  });

  const pagedImages = filteredImages.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredImages.length / pageSize);

  return (
    <div>
      <Breadcrumb aria-label="breadcrumb" className="px-5 py-3">
        <BreadcrumbItem href="#" icon={HomeIcon}>Dashboard</BreadcrumbItem>
        <BreadcrumbItem>{m("footerImageManagement")}</BreadcrumbItem>
      </Breadcrumb>

      <div className="p-6 shadow rounded-2xl">
        {/* Header filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <Dropdown inline={true} arrowIcon={false}
            label={
              <button className="w-48 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 flex justify-between items-center">
                {options.find(o => o.value === sortStatus)?.label}
                  <FaChevronDown className="ml-2" />
              </button>
            }
          >
            {options.map(opt => (
              <DropdownItem
                key={opt.value}
                onClick={() => setSortStatus(opt.value as "all" | "active" | "inactive")}
                className={`${sortStatus === opt.value ? "font-semibold" : ""}`}
              >
                {opt.label}
              </DropdownItem>
          ))}
          </Dropdown>
          <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => { 
              setEditing(null); 
              setMode("add"); 
              setOpenModal(true); }}
          >
            <FaPlus />
          </Button>
        </div>

        {/* Images grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {pagedImages.map(img => (
            <div key={img._id} className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div 
                className="relative w-full aspect-square"
                onClick={() => {
                  setEditing(img);
                  setMode("view");
                  setOpenModal(true);
                }}
              >
                <Image src={img.image} alt={img.title} fill className="object-cover" />
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-gray-800 font-medium truncate">{img.title}</h3>
                <div className="mt-auto flex justify-between items-center gap-2">
                  <ToggleSwitch
                    className="!h-4 !w-8 sm:!h-5 sm:!w-10"
                    checked={!!img.isActive}
                    onChange={(val) => handleActiveStatus(img, val)}
                  />
                  <div className="flex gap-1 sm:gap-2">
                    <Button size="sm" color="yellow" className="px-2 py-1 sm:px-3 sm:py-2" 
                      onClick={() => { 
                        setEditing(img); 
                        setMode("edit"); 
                        setOpenModal(true); 
                      }}
                    >
                      <FaPen />
                    </Button>
                    <Button size="sm" color="red" className="px-2 py-1 sm:px-3 sm:py-2" 
                      onClick={() => { 
                        setSelectedId(img._id!); 
                        setOpenConfirm(true);
                      }}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded hover:bg-green-700 hover:text-white transition
                          ${page === currentPage ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'}`}
            >
              {page}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Footer Image Modal */}
      <FooterImageModal
        isOpen={openModal}
        onClose={() => { setOpenModal(false); setEditing(null); }}
        onSubmit={handleSave}
        initialData={editing}
        mode={mode}
        activeCount={images.filter((img) => img.isActive).length}
        prevOrder={prevOrderRef.current}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        show={openConfirm}
        onClose={() => setOpenConfirm(false)}
        type="error"
        title={t("f.deleteConfirmTitle")}
        message={t("f.deleteConfirmMessage")}
        onConfirm={handleDelete}
      />
    </div>
  );
}