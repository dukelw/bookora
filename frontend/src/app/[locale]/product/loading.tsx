export default function Loading() {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-6 w-40 bg-gray-300 rounded mb-4" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border rounded p-3 shadow space-y-2">
            <div className="w-full h-32 bg-gray-300 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
