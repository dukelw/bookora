"use client";

import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { wishlistService } from "@/services/wishlistService";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/authStore";

type Props = {
  bookId: string;
  className?: string;
  size?: number;
};

export default function WishlistButton({
  bookId,
  className = "",
  size = 18,
}: Props) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    // Chỉ gọi status khi đã đăng nhập (API yêu cầu JWT)
    if (user?._id && bookId) {
      wishlistService
        .status(bookId)
        .then((res) => mounted && setInWishlist(!!res?.inWishlist))
        .catch(() => {});
    }
    return () => {
      mounted = false;
    };
  }, [user?._id, bookId]);

  const handleToggle = async () => {
    if (!user?._id) {
      toast.info("Vui lòng đăng nhập để sử dụng wishlist");
      return;
    }
    if (loading) return;
    try {
      setLoading(true);
      const res = await wishlistService.toggle(bookId);
      setInWishlist(res.inWishlist);
      window.dispatchEvent(new CustomEvent("wishlist:changed"));
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Thao tác wishlist thất bại";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      aria-label="toggle-wishlist"
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center justify-center ${className}`}
      title={inWishlist ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
    >
      {inWishlist ? (
        <FaHeart size={size} className="text-red-500" />
      ) : (
        <FaRegHeart size={size} />
      )}
    </button>
  );
}
