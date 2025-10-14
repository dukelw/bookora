"use client";

import AppFooter from "@/app/layout/default/Footer";
import AppNavbar from "@/app/layout/default/NavBar";
import { cartService } from "@/services/cartService";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { eventBus } from "@/utils/eventBus";
import { useEffect } from "react";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const { setCart } = useCartStore();

  useEffect(() => {
    const handleRefresh = async () => {
      if (user?._id) {
        const cart = await cartService.getCart(user._id);
        setCart(cart);
      }
    };

    eventBus.on("cart:refresh", handleRefresh);
    return () => eventBus.off("cart:refresh", handleRefresh);
  }, [user?._id]);

  return (
    <div>
      <AppNavbar />
      {children}
//       <AppFooter />
    </div>
  );
}
