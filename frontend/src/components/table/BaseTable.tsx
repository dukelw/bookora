"use client";

import React from "react";

export interface Column<T = any> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode; // Nếu muốn custom render cho cột
}
interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
}

export default function BaseTable<T extends { _id?: string }>({
  columns,
  data,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-[#00684a] text-white">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-sm font-medium border-r border-gray-200 ${
                  idx === 0 ? "rounded-tl-lg" : ""
                } ${
                  idx === columns.length - 1 ? "rounded-tr-lg border-r-0" : ""
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, idx) => {
            const isLast = idx === data.length - 1;
            return (
              <tr
                key={item._id}
                className={`hover:bg-gray-50 transition-colors duration-150 ${
                  isLast ? "rounded-br-lg" : ""
                }`}
              >
                {columns.map((col, cIdx) => (
                  <td
                    key={col.key}
                    className={`px-4 py-2 border-r border-gray-200 text-sm text-gray-700 ${
                      isLast && cIdx === 0 ? "rounded-bl-lg" : ""
                    } ${cIdx === columns.length - 1 ? "border-r-0" : ""}`}
                  >
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
