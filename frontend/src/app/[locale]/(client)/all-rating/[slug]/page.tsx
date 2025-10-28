"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ratingService } from "@/services/ratingService";
import { bookService } from "@/services/bookService";
import { FALLBACK_BOOK } from "@/constants";
import { FaStar, FaRegStar } from "react-icons/fa";
import Rating from "@/interfaces/Rating";
import Pagination from "@/components/pagination/pagination";
import { useBookStore } from "@/store/bookStore";
import { useTranslations } from "use-intl";

export default function AllRatingPage() {
  const t = useTranslations("rating");
  const { slug } = useParams();
  const router = useRouter();
  const { bookId } = useBookStore();
  const [bookTitle, setBookTitle] = useState("");
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [average, setAverage] = useState<{ avgStars: number; count: number }>({avgStars: 0, count: 0});
  const [variants, setVariants] = useState<string[]>([]);
  const [selectedVariant, setSelectedVariant] = useState("all");
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    if (!bookId) return;
    (async () => {
      try {
        const data = await bookService.getBook(bookId);
        setBookTitle(data.title);
        const vNames = (data.variants || []).map((v: any) => v.rarity);
        setVariants(vNames);
      } catch (err) {
        console.error(t("fetchBookError"), err);
      }
    })();
  }, [bookId]);

  const fetchRatings = async (page = 1, limit = 6) => {
    if (!bookId) return;
    try {
      setLoading(true);
      const res = await ratingService.getAllRatings(bookId, page, limit);
      const list = Array.isArray(res) ? res : res.items;
      setRatings(list);
      setTotalItems(!Array.isArray(res) ? res.total : list.length);
      setCurrentPage(!Array.isArray(res) ? res.page : page);
      setPageSize(!Array.isArray(res) ? res.limit : limit);
      const avg = await ratingService.getAverageRating(bookId);
      setAverage(avg);
    } catch (err) {
      console.error(t("fetchRatingError"), err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookId) fetchRatings(1, pageSize);
  }, [bookId, pageSize]);

  const filteredRatings =
    selectedVariant === "all" ? ratings : ratings.filter((r) => r.variant?.rarity?.toLowerCase() === selectedVariant.toLowerCase());

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => router.push(`/book/${slug}`)} className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-800 font-medium transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t("backToDetail")}
                </button>
                <div className="flex items-center gap-3">
                    <label htmlFor="variantFilter" className="text-sm font-medium text-gray-700">{t("filterByVariant")}:</label>
                    <select
                        id="variantFilter"
                        className="border rounded-lg px-7 py-1 text-sm text-gray-700"
                        value={selectedVariant}
                        onChange={(e) => setSelectedVariant(e.target.value)}
                    >
                        <option value="all">{t("allVariants")}</option>
                        {variants.map((v) => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                </div>
            </div>
            <h1 className="text-3xl font-bold mb-6">
                {t("allReviewsFor")}{" "}
                <span className="text-yellow-500">{bookTitle || slug}</span>
            </h1>
            <div className="flex items-center gap-3 mb-8">
                <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) =>
                        i < Math.round(average.avgStars) ? (
                        <FaStar key={i} className="w-5 h-5" />
                        ) : (
                        <FaRegStar key={i} className="w-5 h-5 text-gray-300" />
                        )
                    )}
                </div>
                <span className="text-lg font-semibold">{average.avgStars.toFixed(1)} / 5</span>
                <span className="text-gray-500 text-sm">({average.count} {t("reviews")})</span>
            </div>
            {filteredRatings.length === 0 && !loading && (
                <p className="text-gray-500 italic">{t("noReview")}</p>
            )}
            <div className="space-y-4">
                {filteredRatings.map((r, i) => (
                <div key={i} className="flex gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                    <img
                        src={r.user?.avatar || FALLBACK_BOOK}
                        alt="Avatar"
                        className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800">{r.user?.name || t("anonymous")}</h3>
                            <div className="flex text-yellow-400">
                                {Array.from({ length: r.stars }).map((_, i) => (<FaStar key={i} className="w-4 h-4" />))}
                                {Array.from({ length: 5 - r.stars }).map((_, i) => (<FaRegStar key={i} className="w-4 h-4 text-gray-300" />))}
                            </div>
                        </div>
                        {r.variant && (
                            <p className="text-sm italic text-gray-500 mt-1">
                                {t("variant")}:{" "}
                                <span className="text-sm italic text-gray-700">{r.variant?.rarity || t("noVariant")}</span>
                            </p>
                        )}
                        <p className="text-base text-gray-700 mt-2 leading-relaxed">{r.comment || "—"}</p>
                        <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString("vi-VN")}</p>
                        </div>
                    </div>
                ))}
            </div>

            {ratings.length > 0 && (
                <div className="mt-8 flex justify-center">
                    <Pagination
                        totalItems={totalItems}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        onPageChange={(page) => fetchRatings(page, pageSize)}
                        onPageSizeChange={(size) => fetchRatings(1, size)}
                    />
                </div>
            )}
        </div>
    );
}