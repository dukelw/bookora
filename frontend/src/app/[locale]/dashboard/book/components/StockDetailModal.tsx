"use client";

import {
  Modal,
  Table,
  Badge,
  ModalHeader,
  ModalBody,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";
import Image from "next/image";
import { formatCurrency } from "@/utils/format";
import { FALLBACK_BOOK } from "@/constants";
import { useTranslations } from "use-intl";
import Book from "@/interfaces/Book";
import BaseTable, { Column } from "@/components/table/BaseTable";

interface StockDetailModalProps {
  show: boolean;
  onClose: () => void;
  book: Book | null;
}

export default function StockDetailModal({
  show,
  onClose,
  book,
}: StockDetailModalProps) {
  const t = useTranslations("dashboard");
  if (!book) return null;

  const columns: Column<any>[] = [
    {
      key: "rarity",
      label: t("p.category"),
      render: (variant) => (
        <Badge
          color={
            variant.rarity === "common"
              ? "success"
              : variant.rarity === "rare"
              ? "warning"
              : variant.rarity === "limited"
              ? "failure"
              : "info"
          }
        >
          {variant.rarity}
        </Badge>
      ),
    },
    {
      key: "image",
      label: t("i.image"),
      render: (variant) => (
        <img
          src={variant.image ?? FALLBACK_BOOK}
          alt="Ảnh minh họa"
          width="50"
          height="50"
          className="rounded-md object-cover"
        />
      ),
    },
    {
      key: "price",
      label: t("p.price"),
      render: (variant) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(variant.price)}
        </span>
      ),
    },
    {
      key: "stock",
      label: t("p.stock"),
      render: (variant) => (
        <span
          className={`font-medium ${
            variant.stock < 50
              ? "text-red-600"
              : variant.stock < 200
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {variant.stock.toLocaleString()} {t("i.books")}
        </span>
      ),
    },
    {
      key: "isbn",
      label: "ISBN",
      render: (variant) => (
        <span className="text-gray-700">{variant.isbn ?? "—"}</span>
      ),
    },
  ];

  return (
    <Modal show={show} onClose={onClose} size="4xl">
      <ModalHeader>
        {t("i.stockDetail")} — {book.title}
      </ModalHeader>

      <ModalBody>
        <BaseTable columns={columns} data={book.variants || []} />
      </ModalBody>
    </Modal>
  );
}
