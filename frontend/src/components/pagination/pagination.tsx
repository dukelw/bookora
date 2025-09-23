import React, { useMemo, useState } from "react";

interface Props {
  totalItems: number;
  currentPage: number; // 1-based
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

export default function Pagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className = "",
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const [jumpInput, setJumpInput] = useState<string>("");

  // compute showing range
  const range = useMemo(() => {
    if (totalItems === 0) return { from: 0, to: 0 };
    const from = (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, totalItems);
    return { from, to };
  }, [currentPage, pageSize, totalItems]);

  const handleGoto = (raw?: string | number) => {
    const candidate = typeof raw === "number" ? raw : Number(raw ?? jumpInput);
    if (Number.isNaN(candidate)) return;
    const page = Math.min(Math.max(1, Math.floor(candidate)), totalPages);
    if (page === currentPage) return setJumpInput("");
    onPageChange(page);
    setJumpInput("");
  };

  const renderPageNumbers = () => {
    // simple compact pagination with first/last + neighbors
    const pages: (number | "...")[] = [];
    const sibling = 1; // show 1 neighbor each side
    const left = Math.max(1, currentPage - sibling);
    const right = Math.min(totalPages, currentPage + sibling);

    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push("...");
    }

    for (let p = left; p <= right; p++) pages.push(p);

    if (right < totalPages) {
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages.map((p, idx) =>
      p === "..." ? (
        <span key={`e-${idx}`} className="px-2 text-sm">
          {p}
        </span>
      ) : (
        <button
          key={`p-${p}`}
          onClick={() => onPageChange(p as number)}
          className={`h-8 px-3 rounded text-sm transition select-none focus:outline-none focus:ring-2 focus:ring-green-300 
            ${
              p === currentPage
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-green-50"
            }`}
        >
          {p}
        </button>
      )
    );
  };

  return (
    <div
      className={`flex items-center gap-4 p-3 bg-white rounded ${className}`}
    >
      {/* Showing X of Y */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span className="text-gray-500">Showing</span>
        <span className="font-medium">{range.from}</span>
        <span className="text-gray-500">-</span>
        <span className="font-medium">{range.to}</span>
        <span className="text-gray-500">of</span>
        <span className="font-medium">{totalItems}</span>
      </div>

      {/* Page size select */}
      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">/ page</label>
          <input
            type="number"
            min={1}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="w-16 h-8 px-2 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
      )}

      {/* pagination controls */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`h-8 px-3 rounded text-sm transition select-none focus:outline-none focus:ring-2 focus:ring-green-300 
            ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-green-50"
            }`}
        >
          Prev
        </button>

        <div className="flex items-center gap-1">{renderPageNumbers()}</div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`h-8 px-3 rounded text-sm transition select-none focus:outline-none focus:ring-2 focus:ring-green-300 
            ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-green-50"
            }`}
        >
          Next
        </button>

        {/* Quick jump input */}
        <div className="flex items-center gap-2 ml-3">
          <input
            type="number"
            min={1}
            max={totalPages}
            placeholder="Go to"
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleGoto();
            }}
            className="w-20 h-8 px-2 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <button
            onClick={() => handleGoto()}
            className="h-8 px-3 rounded bg-green-600 text-white text-sm hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
}
