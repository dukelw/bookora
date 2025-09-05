const menuItems = [
  { id: "home", label: "Home" },
  { id: "users", label: "Users" },
  { id: "inventory", label: "Inventory" }, // Thêm Inventory
  { id: "settings", label: "Settings" },
];

export default function Sidebar({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  return (
    <div className="w-48 bg-gray-100 h-full p-4 space-y-2">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="w-full text-left px-2 py-1 hover:bg-gray-200"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
