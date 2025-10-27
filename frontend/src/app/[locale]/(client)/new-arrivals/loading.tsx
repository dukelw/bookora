"use client";

export default function Loading() {
  return (
    <div className="p-6 flex flex-col items-center min-h-[70vh] max-w-7xl mx-auto">
      <div className="w-[98%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white rounded-2xl shadow p-4"
          >
            <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
