"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Rating } from "@/interfaces/Rating";
import { ratingService } from "@/services/ratingService";
import { FALLBACK_BOOK } from "@/constants";
import { useSocket } from "@/app/hooks/useSocket";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

export default function ReviewSlider({ bookId }: { bookId: string }) {
  const [reviews, setReviews] = useState<Rating[]>([]);
  const [average, setAverage] = useState<{ avgStars: number; count: number }>({
    avgStars: 0,
    count: 0,
  });
  const socket = useSocket();

  useEffect(() => {
    if (!bookId || !socket) return;

    const fetchReviews = async () => {
      try {
        const data = await ratingService.getRatings(bookId);
        setReviews(data);

        const avg = await ratingService.getAverageRating(bookId);
        setAverage(avg);
      } catch (err) {
        console.error("Không thể lấy đánh giá:", err);
      }
    };

    fetchReviews();

    socket.emit("joinProductRoom", bookId);
    socket.on("ratingUpdate", fetchReviews);

    return () => {
      socket.off("ratingUpdate", fetchReviews);
    };
  }, [bookId, socket]);

  if (!reviews.length) return null;

  return (
    <div className="mt-10 overflow-hidden relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Đánh giá</h2>
        <button
          onClick={() => console.log("Xem tất cả review của", bookId)}
          className="text-yellow-400 font-medium hover:underline"
        >
          Xem tất cả
        </button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-1 text-yellow-400">
          {Array.from({ length: 5 }).map((_, i) => {
            if (i + 1 <= Math.floor(average.avgStars)) {
              return <FaStar key={i} className="w-5 h-5" />;
            } else if (i + 0.5 < average.avgStars) {
              return <FaStarHalfAlt key={i} className="w-5 h-5" />;
            } else {
              return <FaRegStar key={i} className="w-5 h-5 text-gray-300" />;
            }
          })}
        </div>

        <span className="text-gray-800 font-semibold text-lg">
          {average.avgStars.toFixed(1)} / 5
        </span>

        <span className="text-gray-500 text-sm">
          ({average.count} đánh giá)
        </span>
      </div>
      {/* Track chính */}
      <motion.div
        className="flex gap-6 p-4 w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          duration: 30,
          ease: "linear",
        }}
      >
        {[...reviews, ...reviews].map((review, index) => (
          <div
            key={index}
            className="min-w-[300px] max-w-sm p-6 bg-white/95 text-gray-900 
               rounded-2xl shadow-lg shadow-500/10 
               flex flex-col gap-3 hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-4">
              <Image
                src={review.user?.avatar || FALLBACK_BOOK}
                alt={review.user?.name || "User"}
                width={56}
                height={56}
                className="rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold">
                  {review.user?.name || "Ẩn danh"}
                </h3>
                <div className="flex text-yellow-400">
                  {Array.from({ length: review.stars }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                  {Array.from({ length: 5 - review.stars }).map((_, i) => (
                    <span key={i} className="text-gray-400">
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-700 italic">{review.comment || "—"}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
