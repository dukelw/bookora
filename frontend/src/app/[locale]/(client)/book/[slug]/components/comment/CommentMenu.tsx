"use client";
import React from "react";
import { useTranslations } from "use-intl";

interface CommentMenuProps {
    onEdit: () => void;
    onDelete: () => void;
}

export default function CommentMenu({
    onEdit,
    onDelete,
}: CommentMenuProps) {
    const t = useTranslations("comment");
    return (
        <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-10 w-28">
            <button
                onClick={onEdit}
                className="block w-full text-left hover:bg-gray-100 text-sm px-2 py-2"
            >
                {t("edit")}
            </button>
            <button
                onClick={onDelete}
                className="block w-full text-left text-red-600 hover:bg-gray-100 text-sm px-2 py-2"
            >
                {t("delete")}
            </button>
        </div>
    );
}