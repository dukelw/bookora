"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TextInput,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  HomeIcon,
  Badge,
} from "flowbite-react";
import { FaSearch, FaPlus, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useTranslations } from "use-intl";
import BaseTable from "@/components/table/BaseTable";
import ConfirmModal from "@/app/components/ui/modal/ConfirmModal";
import Pagination from "@/components/pagination/pagination";
import { collectionService } from "@/services/collectionService";
import { sliderService } from "@/services/sliderService";
import Collection from "@/interfaces/Collection";
import Slider from "@/interfaces/Slider";
import SliderModal from "./components/SliderModal";
import CollectionModal from "./components/CollectionModal";

export default function CollectionManagementPage() {
  const t = useTranslations("dashboard.collection");

  const [search, setSearch] = useState("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [openCollectionModal, setOpenCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [openSliderModal, setOpenSliderModal] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);

  // ✅ Fetch Collections có phân trang
  const fetchCollections = useCallback(async () => {
    try {
      const res = await collectionService.getCollections({
        keySearch: search,
        page,
        limit,
      });
      setCollections(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error(t("error"), err);
      toast.error(t("actionFailed"));
    }
  }, [search, page, limit]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // CRUD Collection
  const handleSaveCollection = async (data: { name: string }) => {
    try {
      if (editingCollection?._id) {
        toast.info(t("collectionUpdateNotImplemented"));
      } else {
        await collectionService.createCollection(data);
        toast.success(t("createdSuccessfully"));
      }
      await fetchCollections();
    } catch (err) {
      toast.error(t("actionFailed"));
    } finally {
      setOpenCollectionModal(false);
      setEditingCollection(null);
    }
  };

  const handleDeleteCollection = async () => {
    if (!selectedId) return;
    try {
      await collectionService.removeCollection(selectedId);
      toast.success(t("deletedSuccessfully"));
      await fetchCollections();
    } catch {
      toast.error(t("failedDeleteCollection"));
    } finally {
      setOpenConfirm(false);
      setSelectedId(null);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await collectionService.setActive(id, !active);
      await fetchCollections();
      toast.success(t("statusUpdated"));
    } catch {
      toast.error(t("failedUpdateStatus"));
    }
  };

  const handleOpenSliders = async (collection: Collection) => {
    setSelectedCollection(collection);
    try {
      const res = await sliderService.getSliders();
      const filtered = res.filter(
        (s: Slider) => s.collection?._id === collection._id
      );
      setSliders(filtered);
    } catch {
      toast.error(t("failedFetchSliders"));
    }
  };

  // CRUD Slider
  const handleSaveSlider = async (data: Slider) => {
    try {
      if (editingSlider?._id) {
        toast.info(t("sliderUpdateNotImplemented"));
      } else {
        await sliderService.createSlider(data);
        toast.success(t("sliderCreated"));
      }
      if (selectedCollection?._id) await handleOpenSliders(selectedCollection);
    } catch {
      toast.error(t("failedSaveSlider"));
    } finally {
      setOpenSliderModal(false);
      setEditingSlider(null);
    }
  };

  const handleDeleteSlider = async (id: string) => {
    try {
      await sliderService.removeSlider(id);
      toast.success(t("sliderDeleted"));
      setSliders((prev) => prev.filter((s) => s._id !== id));
    } catch {
      toast.error(t("failedDeleteSlider"));
    }
  };

  const handleToggleSliderActive = async (id: string, active: boolean) => {
    try {
      await sliderService.setActive(id, !active);
      if (selectedCollection) await handleOpenSliders(selectedCollection);
      toast.success(t("statusUpdated"));
    } catch {
      toast.error(t("failedUpdateStatus"));
    }
  };

  const collectionColumns = [
    { key: "_id", label: "ID" },
    { key: "name", label: t("name") },
    {
      key: "isActive",
      label: t("status"),
      render: (col: Collection) => (
        <Badge
          color={col.isActive ? "success" : "gray"}
          onClick={() => handleToggleActive(col._id!, col.isActive!)}
          className="cursor-pointer px-3 py-1 text-sm"
        >
          {col.isActive ? (
            <>
              <FaCheck className="inline mr-1" /> {t("active")}
            </>
          ) : (
            <>
              <FaTimes className="inline mr-1" /> {t("inactive")}
            </>
          )}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: t("actions"),
      render: (col: Collection) => (
        <div className="flex gap-2">
          <Button color="blue" size="sm" onClick={() => handleOpenSliders(col)}>
            {t("viewSliders")}
          </Button>
          <Button
            color="red"
            size="sm"
            onClick={() => {
              setSelectedId(col._id!);
              setOpenConfirm(true);
            }}
          >
            <FaTrash />
          </Button>
        </div>
      ),
    },
  ];

  const sliderColumns = [
    { key: "_id", label: "ID" },
    { key: "title", label: t("title") },
    {
      key: "image",
      label: t("image"),
      render: (s: Slider) => (
        <img
          src={s.image}
          alt={s.title}
          className="w-16 h-10 object-cover rounded"
        />
      ),
    },
    {
      key: "isActive",
      label: t("status"),
      render: (s: Slider) => (
        <Badge
          color={s.isActive ? "success" : "gray"}
          onClick={() => handleToggleSliderActive(s._id!, s.isActive!)}
          className="cursor-pointer px-3 py-1 text-sm"
        >
          {s.isActive ? (
            <>
              <FaCheck className="inline mr-1" /> {t("active")}
            </>
          ) : (
            <>
              <FaTimes className="inline mr-1" /> {t("inactive")}
            </>
          )}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: t("actions"),
      render: (s: Slider) => (
        <Button
          color="red"
          size="sm"
          onClick={() => handleDeleteSlider(s._id!)}
        >
          <FaTrash />
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Breadcrumb aria-label="breadcrumb" className="px-5 py-3">
        <BreadcrumbItem href="#" icon={HomeIcon}>
          {t("dashboard")}
        </BreadcrumbItem>
        <BreadcrumbItem>{t("sliderCollections")}</BreadcrumbItem>
      </Breadcrumb>

      <div className="shadow p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <TextInput
            placeholder={t("searchCollections")}
            icon={FaSearch}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-60"
          />
          <Button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => setOpenCollectionModal(true)}
          >
            <FaPlus />
            {t("createCollection")}
          </Button>
        </div>

        <BaseTable columns={collectionColumns} data={collections} />

        {/* ✅ Pagination thật sự */}
        <Pagination
          totalItems={total}
          currentPage={page}
          pageSize={limit}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
        />

        <CollectionModal
          isOpen={openCollectionModal}
          onClose={() => setOpenCollectionModal(false)}
          onSubmit={handleSaveCollection}
          initialData={editingCollection}
        />

        <ConfirmModal
          show={openConfirm}
          onClose={() => setOpenConfirm(false)}
          type="error"
          title={t("confirmDeleteCollection")}
          message={t("areYouSureDeleteCollection")}
          onConfirm={handleDeleteCollection}
        />

        {selectedCollection && (
          <div className="mt-10 border-t pt-6">
            <div className="flex justify-between mb-3">
              <h3 className="text-xl font-semibold">
                {t("sliderIn")}: {selectedCollection.name}
              </h3>
              <Button color="green" onClick={() => setOpenSliderModal(true)}>
                <FaPlus className="mr-2" /> {t("createSlider")}
              </Button>
            </div>
            <BaseTable columns={sliderColumns} data={sliders} />
          </div>
        )}

        <SliderModal
          isOpen={openSliderModal}
          onClose={() => setOpenSliderModal(false)}
          onSubmit={handleSaveSlider}
          initialData={
            editingSlider || {
              title: "",
              image: "",
              collection: selectedCollection?._id!,
            }
          }
        />
      </div>
    </div>
  );
}
