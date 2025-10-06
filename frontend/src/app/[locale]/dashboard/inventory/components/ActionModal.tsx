"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal, ModalBody, ModalHeader, Label, TextInput, Select, Dropdown, DropdownItem, Button } from "flowbite-react";
import { bookService } from "@/services/bookService";
import { purchaseInvoiceService } from "@/services/purchaseInvoiceService";
import { toast } from "react-toastify";
import { useTranslations } from "use-intl";

interface BookVariant {
  _id: string;
  rarity: string;
  price: number;
  stock: number;
}

interface Book {
  _id: string;
  title: string;
  variants: BookVariant[];
}

interface InventoryItemForm {
  book: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  note?: string;
}

interface InvoiceForm {
  invoiceNumber: string;
  supplier: string;
  note?: string;
  items: InventoryItemForm[];
}

interface InventoryModalProps {
  show: boolean;
  setShow: (val: boolean) => void;
}

export default function InventoryModal({ show, setShow }: InventoryModalProps) {
  const t = useTranslations("dashboard");
  
  const [books, setBooks] = useState<Book[]>([]);
  const [searchKey, setSearchKey] = useState("");
  const [items, setItems] = useState<InventoryItemForm[]>([]);

  const { register, handleSubmit, control, watch, resetField } =
    useForm<InventoryItemForm>();
  const {
    register: regInvoice,
    handleSubmit: handleInvoiceSubmit,
    reset: resetInvoice,
  } = useForm<{ invoiceNumber: string; supplier: string; note?: string }>();

  const selectedBookId = watch("book");
  const selectedBook = books?.find((b) => b._id === selectedBookId);

  // Lấy danh sách sách
  const handleGetBook = async () => {
    const res = await bookService.getBooks(searchKey);
    setBooks(res.items);
  };

  useEffect(() => {
    handleGetBook();
  }, [searchKey]);

  const addItem = (data: InventoryItemForm) => {
    if (!data.book || !data.variant || !data.quantity || !data.unitPrice)
      return;

    const newItems = [...items, data]; // tạo mảng mới
    setItems(newItems);

    resetField("book");
    resetField("variant");
    resetField("quantity");
    resetField("unitPrice");
    resetField("note");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const createInvoice = async (invoiceData: {
    invoiceNumber: string;
    supplier: string;
    note?: string;
  }) => {
    const payload: InvoiceForm = {
      ...invoiceData,
      items: items.map((i) => ({
        ...i,
        purchaseInvoice: invoiceData.invoiceNumber, // tạm đặt invoiceNumber cho field này
      })),
    };
    console.log("Invoice payload:", payload);
    const res = await purchaseInvoiceService.createLot(payload);
    if (res) {
      toast.success(t("i.createSuccess"));
    } else {
      toast.error(t("i.createFail"));
    }
    handleGetBook();
    setItems([]);
    resetInvoice();
    setShow(false);
  };

  return (
    <Modal show={show} size="4xl" onClose={() => setShow(false)}>
      <ModalHeader className="border-gray-200">{t("i.create")}</ModalHeader>
      <ModalBody>
        {/* Form Invoice info */}
        <form
          onSubmit={handleInvoiceSubmit(createInvoice)}
          className="flex flex-col gap-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("i.invoiceNumber")} *
              </label>
              <input
                type="text"
                placeholder={t("i.invoiceNumber")}
                {...regInvoice("invoiceNumber", { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("i.supplier")} *
              </label>
              <input
                type="text"
                placeholder={t("i.supplier")}
                {...regInvoice("supplier", { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">
              {t("i.searchBook")}
            </label>
            <input
              type="text"
              placeholder={t("i.searchPlaceholder")} 
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex-1">
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("i.selectBook")} *
              </label>
              <Controller
                name="book"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t("i.selectBook")}</option>
                    {books.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.title}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            <div className="flex-1">
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("i.selectVariant")} *
              </label>
              <Controller
                name="variant"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t("i.selectVariant")}</option>
                    {selectedBook?.variants.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.rarity} - {t("p.price")}: {v.price} - {t("p.stock")}: {v.stock}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("i.quantity")} *
              </label>
              <input
                type="number"
                placeholder={t("i.quantity")}
                {...register("quantity", { required: true, min: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-700 mb-2">
                {t("i.unitPrice")} *
              </label>
              <input
                type="number"
                placeholder={t("i.supplier")}
                {...register("unitPrice", { required: true, min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">
              {t("i.note")}
            </label>
            <textarea
              rows={3}
              placeholder={t("i.note")}
              {...register("note")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {items.length > 0 && (
            <div className="mt-4 space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 border rounded bg-white"
                >
                  <div>
                    <span className="font-medium">
                      {books?.find((b) => b._id === item.book)?.title}
                    </span>
                    <span className="mx-2"></span>
                    <span>
                      {
                        selectedBook?.variants.find(
                          (v) => v._id === item.variant
                        )?.rarity
                      }
                    </span>
                    <span className="mx-4"></span>
                    <span>{t("i.quantity")}: {item.quantity}</span>
                    <span className="mx-4"></span>
                    <span>{t("i.unitPrice")}: {item.unitPrice}</span>
                  </div>
                  <button
                    type="button"
                    className="text-red-600 hover:bg-red-100 rounded p-1"
                    onClick={() => removeItem(index)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
            )}
          
          <div className="mt-3 flex flex-col gap-4 w-full">
            <div className="-mx-6 border-t border-gray-200 w-full-2xl" />
            <div className="flex justify-end gap-4 mt-3 mb-2">
              <button
                type="button"
                className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
                onClick={handleSubmit(addItem)}
              >
                {t("i.addBook")}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={items.length === 0}
              >
                {t("i.create")}
              </button>
            </div>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}
