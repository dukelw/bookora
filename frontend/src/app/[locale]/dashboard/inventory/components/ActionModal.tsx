"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { bookService } from "@/services/bookService";
import { purchaseInvoiceService } from "@/services/purchaseInvoiceService";
import { toast } from "react-toastify";

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
  const selectedBook = books.find((b) => b._id === selectedBookId);

  // Lấy danh sách sách
  const handleGetBook = async () => {
    const res = await bookService.getBooks(searchKey);
    setBooks(res);
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
      toast.success("Create invoice and inventory successfully!");
    } else {
      toast.error("Create invoice and inventory failed!");
    }
    handleGetBook();
    setItems([]);
    resetInvoice();
    setShow(false);
  };

  return (
    <Modal show={show} size="4xl" popup onClose={() => setShow(false)}>
      <ModalHeader className="p-6">Tạo hóa đơn nhập sách</ModalHeader>
      <ModalBody>
        {/* Form Invoice info */}
        <form
          onSubmit={handleInvoiceSubmit(createInvoice)}
          className="flex flex-col gap-4"
        >
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice number *
              </label>
              <input
                type="text"
                placeholder="Invoice number"
                {...regInvoice("invoiceNumber", { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
      focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier *
              </label>
              <input
                type="text"
                placeholder="Supplier"
                {...regInvoice("supplier", { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
      focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <input
              type="text"
              placeholder="Note"
              {...regInvoice("note")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
    focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Form thêm sách */}
          <div className="flex flex-col gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm sách
              </label>
              <input
                type="text"
                placeholder="Tìm sách..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
      focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn sách *
                </label>
                <Controller
                  name="book"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn sách</option>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn biến thể *
                </label>
                <Controller
                  name="variant"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn biến thể</option>
                      {selectedBook?.variants.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.rarity} - Giá: {v.price} - Stock: {v.stock}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng *
                </label>
                <input
                  type="number"
                  placeholder="Số lượng"
                  {...register("quantity", { required: true, min: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md 
        focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá nhập *
                </label>
                <input
                  type="number"
                  placeholder="Giá nhập"
                  {...register("unitPrice", { required: true, min: 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md 
        focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <input
                type="text"
                placeholder="Ghi chú"
                {...register("note")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
      focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* List các sách đã thêm */}
            {items.length > 0 && (
              <div className="mt-4 space-y-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border rounded bg-white"
                  >
                    <div>
                      <span className="font-medium">
                        {books.find((b) => b._id === item.book)?.title}
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
                      <span>Số lượng: {item.quantity}</span>
                      <span className="mx-4"></span>
                      <span>Giá nhập: {item.unitPrice}</span>
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

            <div className="flex items-center justify-end gap-4 mt-2">
              <button
                type="button"
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={handleSubmit(addItem)}
              >
                Thêm sách
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                disabled={items.length === 0}
              >
                Tạo hóa đơn
              </button>
            </div>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}
