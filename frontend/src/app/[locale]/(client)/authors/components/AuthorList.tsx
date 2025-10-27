"use client";

import React from "react";
import { useTranslations } from "use-intl";

interface Author {
  author: string;
  books: number;
}

interface Props {
  authors: Author[];
  onSelect: (author: string) => void;
  activeAuthor: string | null;
}

export default function AuthorList({
  authors,
  onSelect,
  activeAuthor,
}: Props) {
  const t = useTranslations("authors");
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <button
        onClick={() => onSelect("")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeAuthor === null || activeAuthor === "" ? "bg-cyan-600 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
      >
        {t("all")}
      </button>
      {authors.map((a) => (
        <button
          key={a.author}
          onClick={() => onSelect(a.author)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeAuthor === a.author ? "bg-cyan-600 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          {a.author} <span className="text-xs text-gray-500">({a.books})</span>
        </button>
      ))}
    </div>
  );
}
