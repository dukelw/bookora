"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { wishlistService } from "@/services/wishlistService";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/authStore";
import WishlistItem from "@/interfaces/WishlistItem";
import { formatCurrency } from "@/utils/format";
import { FaTrash } from "react-icons/fa";
import Pagination from "@/components/pagination/pagination";
import { useTranslations } from "use-intl";

export default function WishlistPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const t = useTranslations("wishlist");

  const fetchData = async () => {
    try {
      if (!user?._id) return;
      setLoading(true);
      const res = await wishlistService.list({ page: currentPage, limit });
      setItems(res?.items || []);
      setTotalItems(res?.meta?.total || 0);
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Không thể tải wishlist";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, currentPage, limit]);

  const handleRemove = async (bookId: string) => {
    try {
      await wishlistService.remove(bookId);
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("removeError"));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">{t("title")}</h2>

        {loading && (
          <div className="opacity-80 text-center">{t("loading")}</div>
        )}

        {!loading && items.length === 0 && (
          <div className="bg-neutral-900 p-8 rounded-lg text-center">
            <p>{t("empty")}</p>
          </div>
        )}

        {/* CARD LIST */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((it) => {
            const b = it.book;
            const link = b.slug ? `/book/${b.slug}` : `book/${b._id}`;
            return (
              <div
                key={it.wishlistId}
                className="bg-neutral-900 rounded-xl overflow-hidden shadow hover:shadow-cyan-500/20 transition-all duration-200 flex flex-col"
              >
                {/* IMAGE */}
                <div className="relative w-full">
                  <img
                    src={b.mainImage || "/images/fallback/default-book.png"}
                    alt={b.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemove(b._id)}
                    className="absolute top-2 right-2 bg-neutral-800/70 hover:bg-red-500 p-2 rounded-full transition"
                    title="Xóa khỏi wishlist"
                  >
                    <FaTrash size={13} />
                  </button>
                </div>

                {/* CONTENT */}
                <div className="flex flex-col flex-grow p-3">
                  <Link
                    href={link}
                    className="font-semibold text-base hover:text-cyan-300 line-clamp-1"
                  >
                    {b.title}
                  </Link>

                  {b.author && (
                    <p className="text-gray-400 text-xs line-clamp-1">
                      {b.author}
                    </p>
                  )}

                  {b.categories?.length > 0 && (
                    <p className="text-xs text-cyan-400 mt-1 line-clamp-1">
                      {b.categories.map((c) => c.name).join(", ")}
                    </p>
                  )}

                  <div className="mt-auto">
                    {typeof b.price === "number" && (
                      <p className="font-bold text-cyan-300 mt-2">
                        {formatCurrency(b.price)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {b.releaseYear || "N/A"}
                    </p>
                    <Link
                      href={link}
                      className="block mt-2 text-center bg-cyan-400 hover:bg-cyan-500 text-black font-semibold rounded-lg py-1 text-sm transition"
                    >
                      {t("viewDetails")}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* PAGINATION */}
        {totalItems > 0 && (
          <div className="mt-10 flex justify-center">
            <Pagination
              totalItems={totalItems}
              currentPage={currentPage}
              pageSize={limit}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => {
                setLimit(size);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
