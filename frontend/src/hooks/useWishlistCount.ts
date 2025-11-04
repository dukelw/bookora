"use client";

import { useCallback, useEffect, useState } from "react";
import { wishlistService } from "@/services/wishlistService";
import { useAuthStore } from "@/store/authStore";

export default function useWishlistCount() {
  const { user } = useAuthStore();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user?._id) {
      setCount(0);
      return;
    }
    try {
      // gọi list limit=1 để đọc meta.total do BE trả về
      const res = await wishlistService.list({ page: 1, limit: 1 });
      const total = res?.meta?.total ?? 0;
      setCount(total);
    } catch {
      // im lặng
    }
  }, [user?._id]);

  useEffect(() => { refresh(); }, [refresh]);

  // lắng nghe các sự kiện thay đổi wishlist (do nút toggle bắn ra)
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("wishlist:changed", handler);
    return () => window.removeEventListener("wishlist:changed", handler);
  }, [refresh]);

  return count;
}
