async function fetchProducts() {
  await new Promise((r) => setTimeout(r, 2000));
  return Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    price: (10 + i * 2).toFixed(2),
    image: `https://res.cloudinary.com/dukelewis-workspace/image/upload/v1747039662/uploads/a541itrjuslvtbifaz1q.jpg`,
  }));
}

export default async function ProductPage() {
  const products = await fetchProducts();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Product List</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="border rounded p-3 shadow hover:shadow-lg transition"
          >
            <img
              src={p.image}
              alt={p.name}
              className="w-full h-32 object-cover mb-2"
            />
            <h2 className="font-semibold">{p.name}</h2>
            <p className="text-sm text-gray-600">${p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
