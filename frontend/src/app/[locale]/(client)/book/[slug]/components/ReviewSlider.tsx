"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Review {
  id: number;
  city: string;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
}

export default function ReviewSlider({ bookId }: { bookId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!bookId) return;

    // TODO: call API để lấy reviews theo bookId
    // ví dụ: fetch(`/api/books/${bookId}/reviews`).then(res => res.json()).then(setReviews)

    // Fake data tạm
    setReviews([
      {
        id: 1,
        city: "Taipei",
        user: "Susan Day",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
        rating: 5,
        comment: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
      },
      {
        id: 2,
        city: "Tarragona",
        user: "Carl Moore",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
        rating: 4,
        comment: "Dịch vụ tuyệt vời, sẽ quay lại lần nữa!",
      },
      {
        id: 3,
        city: "Madrid",
        user: "Sam Smith",
        avatar: "https://randomuser.me/api/portraits/men/3.jpg",
        rating: 5,
        comment: "Trải nghiệm cực kỳ đáng nhớ! Highly recommend.",
      },
    ]);
  }, [bookId]);

  if (!reviews.length) return null;

  const loopReviews = [...reviews, ...reviews];

  return (
    <div className="mt-10 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Đánh giá</h2>
        <button
          onClick={() => console.log("Xem tất cả review của", bookId)}
          className="text-cyan-600 font-medium hover:underline"
        >
          Xem tất cả
        </button>
      </div>

      {/* Auto scroll */}
      <motion.div
        className="flex gap-6 p-4"
        animate={{ x: ["0%", "-100%"] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      >
        {loopReviews.map((review) => (
          <div
            key={review.id + review.user}
            className="min-w-[300px] max-w-sm p-6 bg-white rounded-xl shadow-md flex flex-col gap-3"
          >
            <div className="flex items-center gap-4">
              <img
                src={review.avatar}
                alt={review.user}
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold">{review.city}</h3>
                <div className="flex text-cyan-500">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                  {Array.from({ length: 5 - review.rating }).map((_, i) => (
                    <span key={i} className="text-gray-300">
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-600">{review.comment}</p>
            <p className="font-semibold">{review.user}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
