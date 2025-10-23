/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";

interface SingleSelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (selected: T | null) => void;
  getId: (item: T) => string | number;
  getLabel: (item: T) => string;
  placeholder?: string;
  disabled?: boolean;
}

export default function SingleSelect<T>({
  options,
  value,
  onChange,
  getId,
  getLabel,
  placeholder = "Chọn...",
  disabled,
}: SingleSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // đóng khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = value ? getLabel(value) : placeholder;

  return (
    <div className="relative w-full" ref={ref}>
      <div
        onClick={() => !disabled && setOpen(!open)}
        className={`border border-gray-300 rounded-md px-3 py-2 cursor-pointer flex justify-between items-center ${
          disabled ? "bg-gray-100 cursor-not-allowed" : "hover:bg-blue-50"
        }`}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {selectedLabel}
        </span>
        <span className="ml-2 text-gray-500 text-sm">▾</span>
      </div>

      {open && !disabled && (
        <div className="absolute z-10 mt-1 w-full border border-gray-200 bg-white rounded-md shadow-md max-h-60 overflow-auto">
          {options.map((opt) => (
            <div
              key={getId(opt)}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                value && getId(value) === getId(opt) ? "bg-blue-100 font-medium" : ""
              }`}
            >
              {getLabel(opt)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}