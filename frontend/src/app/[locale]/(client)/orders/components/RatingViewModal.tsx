"use client";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useState, useEffect } from "react";
import { ratingService } from "@/services/ratingService";
import { toast } from "react-toastify";
import { useTranslations } from "use-intl";

export default function RatingViewModal({
  show,
  onClose,
  bookId,
  variantId,
}: any) {
  const [rating, setRating] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const t = useTranslations("rating");

  useEffect(() => {
    if (!show || !bookId || !variantId) return;
    const fetchRating = async () => {
      try {
        setLoading(true);
        const res = await ratingService.getUserRating(bookId, variantId);
        setRating({
          ...res,
          stars: res.rating?.stars ?? 0,
          comment: res.rating?.comment ?? "",
        });
      } catch (err: any) {
        toast.error(err.message || t("fetchError"));
      } finally {
        setLoading(false);
      }
    };
    fetchRating();
  }, [show, bookId, variantId]);

  return (
    <Modal show={show} onClose={onClose} size="4xl" dismissible>
      <ModalHeader>{t("rating")}</ModalHeader>
      <ModalBody>
        {loading ? (
          <p className="text-gray-500 text-center">{t("loading")}</p>
        ) : rating ? (
          <div className="space-y-6">
            {/* --- Thông tin sách & biến thể --- */}
            <div className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
              <div className="relative w-full md:w-1/3 h-72 md:h-auto">
                <img
                  src={
                    rating.book.images?.find((img: any) => img.isMain)?.url ||
                    rating.book.images?.[0]?.url ||
                    "/images/fallback/default-book.png"
                  }
                  alt={rating.book.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 p-6 flex flex-col justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {rating.book.title}
                  </h1>
                  {rating.variant && (
                    <div className="mt-3 space-y-2">
                      {rating.variant.image && (
                        <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={rating.variant.image}
                            alt={rating.variant.rarity || t("variant")}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">{t("variant")}:</span>{" "}
                        {rating.variant.rarity || t("unknown")}
                      </p>
                      {rating.variant.price && (
                        <p className="text-gray-800 text-lg font-semibold">
                          {t("price")}: {rating.variant.price.toLocaleString()}₫
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* --- Số sao --- */}
                <div className="flex flex-col items-center mt-4">
                  <div className="flex gap-1 justify-center mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-3xl ${
                          i < rating.stars ? "text-yellow-400" : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {/* --- Bình luận --- */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-2">
                  <p className="text-gray-800 whitespace-pre-line">
                    {rating.comment || t("noComment")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center">{t("noRating")}</p>
        )}
      </ModalBody>
    </Modal>
  );
}
