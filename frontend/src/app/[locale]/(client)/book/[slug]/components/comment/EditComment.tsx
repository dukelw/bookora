"use client";
import React from "react";
import { useTranslations } from "use-intl";

interface EditCommentProps {
    value: string;
    onChange: (v: string) => void;
    onSave: () => void;
    onCancel: () => void;
    isChild?: boolean;
}

export default function EditComment({
    value,
    onChange,
    onSave,
    onCancel,
    isChild = false,
}: EditCommentProps) {
    const t = useTranslations("comment");
    return (
        <div className="mt-1">
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full border border-gray-300 rounded-lg p-3 ${ isChild ? "text-xs" : "text-sm" } mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500`}
                rows={3}
            />
            <div className="flex gap-2 mt-2 mb-4">
                <button
                    onClick={onSave}
                    className={`px-4 py-1.5 bg-orange-600 text-white rounded-md ${ isChild ? "text-xs" : "text-sm" } hover:bg-orange-700`}
                >
                    {t("save")}
                </button>
                <button
                    onClick={onCancel}
                    className={`px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md ${ isChild ? "text-xs" : "text-sm" } hover:bg-gray-300`}
                >
                    {t("cancel")}
                </button>
            </div>
        </div>
    );
}