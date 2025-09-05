// TabBar.tsx
export default function TabBar({
  tabs,
  activeTab,
  onClose,
  onSelect,
}: {
  tabs: string[];
  activeTab: string;
  onClose: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex border-b bg-gray-50 px-2">
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`px-3 py-2 border-t border-l border-r rounded-t 
            ${tab === activeTab ? "bg-white font-semibold" : "bg-gray-200"} 
            flex items-center space-x-2 mr-2`}
        >
          <button onClick={() => onSelect(tab)}>{tab}</button>
          <button onClick={() => onClose(tab)} className="text-red-500">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
