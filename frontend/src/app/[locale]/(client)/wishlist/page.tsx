"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { wishlistService } from "@/services/wishlistService";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/authStore";
import WishlistItem from "@/interfaces/WishlistItem";
import { formatCurrency } from "@/utils/format";
import WishlistButton from "@/app/components/wishlist/WishlistButton";

export default function WishlistPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 12);

  const locale = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    return parts[0] || "en";
  }, [pathname]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await wishlistService.list({ page, limit });
      setItems(res?.items || []);
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Không thể tải wishlist";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?._id) {
      // Trang này yêu cầu đăng nhập (BE có AuthGuard)
      router.replace(`/${locale}/signin`);
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, page, limit]);

  const handleRemove = async (bookId: string) => {
    try {
      await wishlistService.remove(bookId);
      toast.success("Đã gỡ khỏi wishlist");
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Xóa thất bại");
    }
  };

  const setQuery = (p: number) => {
    const sp = new URLSearchParams(searchParams);
    sp.set("page", String(p));
    router.push(`${pathname}?${sp.toString()}`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Wishlist</h1>

        {loading && <div className="opacity-80">Đang tải...</div>}

        {!loading && items.length === 0 && (
          <div className="bg-neutral-900 p-8 rounded-lg text-center">
            <p>Danh sách yêu thích trống.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => {
            const b = it.book;
            const link =
              b.slug ? `/${locale}/book/${b.slug}` : `/${locale}/book/${b._id}`;
            return (
              <div
                key={it.wishlistId}
                className="bg-neutral-900 rounded-lg overflow-hidden shadow-md"
              >
                <div className="relative h-56 w-full">
                  <img
                    src={b.mainImage || "/placeholder.png"}
                    alt={b.title}
                    className="h-56 w-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <WishlistButton bookId={b._id} />
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <Link href={link} className="font-semibold hover:underline">
                    {b.title}
                  </Link>
                  {b.author && (
                    <p className="text-sm text-gray-400">Tác giả: {b.author}</p>
                  )}
                  {typeof b.price === "number" && (
                    <p className="font-bold mt-1">{formatCurrency(b.price)}</p>
                  )}
                  <div className="flex items-center gap-3 pt-3">
                    <Link
                      href={link}
                      className="px-3 py-1 rounded bg-cyan text-black font-semibold hover:opacity-90"
                    >
                      Xem chi tiết
                    </Link>
                    <button
                      onClick={() => handleRemove(b._id)}
                      className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
                    >
                      Gỡ khỏi wishlist
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination cơ bản */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setQuery(Math.max(page - 1, 1))}
            disabled={page <= 1}
            className="px-3 py-1 rounded bg-neutral-800 disabled:opacity-50"
          >
            ← Trước
          </button>
          <span className="text-sm opacity-80">Trang {page}</span>
          <button
            onClick={() => setQuery(page + 1)}
            className="px-3 py-1 rounded bg-neutral-800"
          >
            Sau →
          </button>
        </div>
      </div>
    </div>
  );
}
