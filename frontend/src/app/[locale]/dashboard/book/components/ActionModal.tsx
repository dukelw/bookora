import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Plus,
  X,
  Book,
  Package,
  Upload,
  Check,
} from "lucide-react";
import { categoryService } from "@/services/categoryService";
import { bookVariantService } from "@/services/bookVariantService";
import { bookService } from "@/services/bookService";
import {
  BookImage,
  Book as BookInterface,
  BookVariant,
  Category,
} from "@/interfaces/Book";
import { Button, Modal, ModalHeader } from "flowbite-react";
import { uploadService } from "@/services/uploadService";
import { toast } from "react-toastify";
import Image from "next/image";
import MultiSelect from "@/components/MultiSelect";
import { formatCurrency } from "@/utils/format";

interface ActionModalProps {
  variantMode?: boolean;
  isOpen: boolean;
  onClose: () => void;
  defaultValues?: Partial<BookInterface>;
}

export default function BookCreationForm({
  variantMode = false,
  isOpen,
  onClose,
  defaultValues,
}: ActionModalProps) {
  const [step, setStep] = useState(variantMode ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [createdBookId, setCreatedBookId] = useState(
    defaultValues ? defaultValues._id : ""
  );
  const [selected, setSelected] = useState<typeof categories>([]);

  // Step 1 - Book form data
  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    publisher: "",
    category: [],
    description: "",
    releaseYear: new Date().getFullYear(),
    images: [],
  });

  // Step 2 - Variant data
  const [variants, setVariants] = useState([]);
  const [currentVariant, setCurrentVariant] = useState({
    rarity: "",
    price: "",
    stock: "",
    isbn: "",
    image: "", // link ảnh sau khi upload
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    if (defaultValues && categories.length > 0) {
      // Map category ids hoặc objects sang object đầy đủ từ categories
      const selectedCategories = (defaultValues.category || [])
        .map((c) => {
          const id = typeof c === "string" ? c : c._id;
          return categories.find((cat) => cat._id === id);
        })
        .filter(Boolean) as Category[];

      setSelected(selectedCategories); // set cho MultiSelect
      setBookData({
        title: defaultValues.title || "",
        author: defaultValues.author || "",
        publisher: defaultValues.publisher || "",
        category: selectedCategories, // giữ object đầy đủ, có thể map sang _id khi submit
        description: defaultValues.description || "",
        releaseYear: defaultValues.releaseYear || new Date().getFullYear(),
        images: (defaultValues.images as any) || [],
      });

      setVariants(defaultValues.variants || []);

      // Set preview URLs nếu defaultValues.images có sẵn
      const urls = defaultValues.images?.map((img) => img.url) || [];
      setPreviewUrls(urls as any);
    }
  }, [defaultValues, categories]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryService.getCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setBookData((prev) => ({ ...prev, images: files }));

    // Create preview URLs
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls as any);
  };

  const removeImage = (index: number) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setBookData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  const handleBookSubmit = async () => {
    if (bookData.images.length < 5) {
      toast.warn("Phải upload ít nhất 5 ảnh");
      return;
    }

    const categoryIds = selected.map((c) => c._id);
    const payload = { ...bookData, category: categoryIds };

    setLoading(true);
    try {
      const imageResult = await uploadService.uploadMultipleFile(
        payload.images ?? []
      );
      if (imageResult?.length) {
        payload.images = imageResult.map((image, index) => ({
          url: image,
          isMain: index === 0,
          order: index + 1,
        })) as any;
      }

      if (!defaultValues) {
        const result = await bookService.createBook(payload);
        setCreatedBookId(result._id);
        setStep(2);
        toast.success("Tạo sách thành công! Mời thêm biến thể.");
      } else {
        const result = await bookService.updateBook(defaultValues._id, payload);
        if (result) {
          setStep(2);
        } else {
          toast.error("Cập nhật sách thất bại");
        }
      }
    } catch (error) {
      console.error("Error creating book:", error);
      toast.error("Có lỗi xảy ra khi tạo sách");
    } finally {
      setLoading(false);
    }
  };

  const addVariantToList = async () => {
    if (
      !currentVariant.rarity ||
      !currentVariant.price ||
      !currentVariant.stock
    ) {
      toast.warn("Vui lòng nhập đầy đủ rarity, price, stock");
      return;
    }

    let imageUrl = "";
    console.log(imageFile);
    if (imageFile) {
      try {
        const res = await uploadService.uploadFile(imageFile);
        imageUrl = res;
      } catch (error) {
        toast.error("Upload ảnh thất bại");
        return;
      }
    }

    const newVariant = {
      ...currentVariant,
      price: parseFloat(currentVariant.price),
      stock: parseInt(currentVariant.stock),
      id: Date.now(),
      image: imageUrl,
    };

    setVariants((prev) => [...prev, newVariant]);
    setCurrentVariant({
      rarity: "",
      price: "",
      stock: "",
      isbn: "",
      image: "",
    });
    setImageFile(null);
  };

  const removeVariant = (id: number) => {
    if (!defaultValues) {
      setVariants((prev) => prev.filter((v, i) => i !== id));
    } else {
      bookVariantService.removeVariant(defaultValues._id ?? "", Number(id));
      setVariants((prev) => prev.filter((v, i) => i !== id));
    }
  };

  const handleVariantsSubmit = async () => {
    if (variants.length === 0) {
      toast.warn("Phải tạo ít nhất 1 biến thể");
      return;
    }

    setLoading(true);
    try {
      // Submit all variants
      for (const variant of variants) {
        await bookVariantService.addVariant(createdBookId, variant);
      }
      toast.success("Tạo biến thể thành công!");
      // Reset form
      setStep(1);
      setBookData({
        title: "",
        author: "",
        publisher: "",
        category: [],
        description: "",
        releaseYear: new Date().getFullYear(),
        images: [],
      });
      setVariants([]);
      setPreviewUrls([]);
      setCreatedBookId(null);
    } catch (error) {
      console.error("Error creating variants:", error);
      toast.error("Có lỗi xảy ra khi tạo biến thể");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addVariantToList();
    }
  };

  return (
    <Modal show={isOpen} size="4xl" onClose={onClose}>
      <ModalHeader className="border-none">Create Book</ModalHeader>
      <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div
            className={`flex items-center ${
              step >= 1 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {step > 1 ? <Check size={16} /> : <Book size={16} />}
            </div>
            <span className="ml-2 font-medium">Tạo sách</span>
          </div>
          <ChevronRight className="mx-4 text-gray-400" size={20} />
          <div
            className={`flex items-center ${
              step >= 2 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              <Package size={16} />
            </div>
            <span className="ml-2 font-medium">Tạo biến thể</span>
          </div>
        </div>

        {/* Step 1: Book Creation */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Thông tin sách
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookData.title}
                    onChange={(e) =>
                      setBookData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tác giả
                  </label>
                  <input
                    type="text"
                    value={bookData.author}
                    onChange={(e) =>
                      setBookData((prev) => ({
                        ...prev,
                        author: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhà xuất bản
                  </label>
                  <input
                    type="text"
                    value={bookData.publisher}
                    onChange={(e) =>
                      setBookData((prev) => ({
                        ...prev,
                        publisher: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục
                  </label>
                  <MultiSelect
                    options={categories}
                    value={selected}
                    onChange={setSelected}
                    getId={(c) => c._id}
                    getLabel={(c) => c.name}
                    placeholder="Chọn danh mục"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={bookData.description}
                    onChange={(e) =>
                      setBookData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Năm xuất bản
                  </label>
                  <input
                    type="number"
                    value={bookData.releaseYear}
                    onChange={(e) =>
                      setBookData((prev) => ({
                        ...prev,
                        releaseYear: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh sách (ít nhất 5) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="images"
                      required
                    />
                    <label
                      htmlFor="images"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <Upload size={32} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click để chọn ảnh
                      </span>
                    </label>
                  </div>

                  {previewUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {previewUrls.map((img, idx) => (
                        <div key={idx} className="relative w-full h-20">
                          <Image
                            src={img}
                            alt={`preview-${idx}`}
                            className="w-full h-full object-cover rounded border"
                            fill
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-gray-500 mt-2">
                    Đã chọn: {bookData.images.length} ảnh
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleBookSubmit}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {loading ? "Đang xử lý..." : "Tiếp tục"}
                {!loading && <ChevronRight size={16} className="ml-2" />}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Variant Creation */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Tạo biến thể sách
            </h2>

            {/* Variant Input Form */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Thêm biến thể mới</h3>
              <div
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
                onKeyDown={handleKeyPress}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phiên bản *
                  </label>
                  <input
                    type="text"
                    value={currentVariant.rarity}
                    onChange={(e) =>
                      setCurrentVariant((prev) => ({
                        ...prev,
                        rarity: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập phiên bản"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá *
                  </label>
                  <input
                    type="number"
                    value={currentVariant.price}
                    onChange={(e) =>
                      setCurrentVariant((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh biến thể
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setImageFile(file);
                    }}
                    className="w-full text-sm text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng *
                  </label>
                  <input
                    type="number"
                    value={currentVariant.stock}
                    onChange={(e) =>
                      setCurrentVariant((prev) => ({
                        ...prev,
                        stock: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ISBN
                  </label>
                  <input
                    type="text"
                    value={currentVariant.isbn}
                    onChange={(e) =>
                      setCurrentVariant((prev) => ({
                        ...prev,
                        isbn: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addVariantToList}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Thêm vào danh sách
              </button>
            </div>

            {/* Variants List */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                Danh sách biến thể ({variants.length})
              </h3>
              {variants.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Chưa có biến thể nào
                </p>
              ) : (
                variants.map((variant: BookVariant, index: number) => (
                  <div
                    key={variant._id}
                    className="flex justify-between items-center p-3 bg-white border rounded-lg"
                  >
                    <div className="flex-1">
                      {variant.image && (
                        <Image
                          width={40}
                          height={40}
                          src={variant.image}
                          alt="variant"
                          className="inline-block w-12 h-12 object-cover rounded mr-4"
                        />
                      )}

                      <span className="font-medium capitalize">
                        {variant.rarity}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="text-green-600 font-medium">
                        {formatCurrency(variant.price)}
                      </span>
                      <span className="mx-2">•</span>
                      <span>Số lượng: {variant.stock}</span>
                      {variant.isbn && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-gray-600">
                            ISBN: {variant.isbn}
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => removeVariant(index)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleVariantsSubmit}
                disabled={loading || variants.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Đang tạo..." : "Hoàn tất"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
