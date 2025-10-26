"use client";

import { Modal, ModalHeader, ModalBody } from "flowbite-react";
import Image from "next/image";
import { formatCurrency } from "@/utils/format";
import BaseTable, { Column } from "@/components/table/BaseTable";

interface OrderDetailModalProps {
  show: boolean;
  onClose: () => void;
  order: any;
}

export default function OrderDetailModal({
  show,
  onClose,
  order,
}: OrderDetailModalProps) {
  if (!order) return null;
  console.log("order detail:::", order, "items", order?.items);

  const columns: Column<any>[] = [
    {
      key: "bookImage",
      label: "Ảnh",
      render: (item) => (
        <img
          src={
            item?.book?.images?.find((img: any) => img.isMain)?.url ||
            "/images/fallback/default-book.png"
          }
          alt={item?.book?.title}
          width="60"
          height="60"
          className="rounded object-cover"
        />
      ),
    },
    { key: "bookTitle", label: "Tên sách", render: (item) => item.book?.title },
    { key: "quantity", label: "Số lượng" },
    {
      key: "price",
      label: "Giá",
      render: (item) => formatCurrency(item.price),
    },
    {
      key: "total",
      label: "Tổng",
      render: (item) => formatCurrency(item.price * item.quantity),
    },
  ];

  const allItems = Array.isArray(order?.items)
    ? order.items.flatMap((group: any) =>
        Array.isArray(group?.items) ? group.items : [group]
      )
    : [];

  return (
    <Modal show={show} onClose={onClose} size="4xl">
      <ModalHeader>Chi tiết đơn hàng</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Thông tin người mua</h4>
          <div className="grid grid-cols-2 gap-4">
            <p>
              <b>Tên:</b> {order.shippingAddress?.name}
            </p>
            <p>
              <b>Điện thoại:</b> {order.shippingAddress?.phone}
            </p>
            <p>
              <b>Email:</b> {order.shippingAddress?.email}
            </p>
            <p>
              <b>Địa chỉ:</b> {order.shippingAddress?.address},{" "}
              {order.shippingAddress?.city}
            </p>
            <p>
              <b>Ghi chú:</b> {order.shippingAddress?.note || "Không có"}
            </p>
          </div>

          <h4 className="text-lg font-semibold mt-6">Sản phẩm</h4>
          <BaseTable columns={columns} data={allItems} />

          <div className="text-right mt-4">
            <p>
              <b>Tạm tính:</b> {formatCurrency(order.totalAmount)}
            </p>
            <p>
              <b>Giảm giá:</b> {formatCurrency(order.discountAmount)}
            </p>
            <p>
              <b>Tổng cộng:</b> {formatCurrency(order.finalAmount)}
            </p>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
