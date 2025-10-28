"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ratingService } from "@/services/ratingService";
import { useRatingStore } from "@/store/ratingStore";
import { useSocket } from "@/app/hooks/useSocket";
import { reviewRequestService } from "@/services/reviewReviewService";
import { useTranslations } from "use-intl";

export default function RatingDetailPage() {
  const t = useTranslations("rating");
  const router = useRouter();
  const { currentBookToRate, clearBookToRate, reviewRequest } = useRatingStore();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const socket = useSocket();

  if (!currentBookToRate)
    return (
      <div className="text-gray-500 p-6 text-center">
        {t("notFoundBook")}
      </div>
    );

  const book = currentBookToRate;
  const variant = book.variant;

  const handleSubmit = async () => {
    if (!stars) return toast.warning(t("selectStarWarning"));

    try {
      const res = await ratingService.addRating(book.bookId, {
        stars,
        comment,
        variant,
      });
      if (res) {
        socket.emit("ratingUpdate", { bookId: book.bookId });
        await reviewRequestService.markAsComplete(reviewRequest);

        clearBookToRate(book.bookId);
        toast.success(t("submitSuccess"));
        router.push("/orders");
      }
    } catch (err) {
      console.error(err);
      toast.error(t("submitError"));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative w-full md:w-1/3 h-80 md:h-auto">
          <img
            src={book.thumbnail || "/default-book.png"}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 p-6 flex flex-col justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>

            {variant ? (
              <div className="mt-3 space-y-2">
                {variant.image && (
                  <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={variant.image}
                      alt={variant.rarity || t("variant")}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">{t("variantName")}:</span>{" "}
                  {variant.rarity || t("unknown")}
                </p>
                {variant.price && (
                  <p className="text-gray-800 text-lg font-semibold">
                    {t("price")}: {variant.price.toLocaleString()}₫
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 mt-2">{t("noVariantInfo")}</p>
            )}
          </div>

          {/* Chọn số sao */}
          <div className="flex flex-col items-center mt-4">
            <div className="flex gap-2 justify-center mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStars(i + 1)}
                  className={`text-4xl transition ${
                    i < stars ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="text-gray-600 text-sm">
              {stars} / 5 {t("stars")}
            </span>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("placeholderComment")}
            className="w-full h-32 bg-gray-50 border border-gray-300 text-gray-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />

          <div className="flex justify-end mt-4">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition"
            >
              {t("submit")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
