/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cart from "@/interfaces/Cart";

type CartState = {
  cart: Cart | null;
  setCart: (cart: Cart) => void;
  clearCart: () => void;
  addItem: (item: any) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,

      setCart: (cart) => set({ cart }),

      clearCart: () => set({ cart: null }),

      addItem: (item) => {
        const currentCart = get().cart;
        if (!currentCart) {
          set({ cart: { _id: "", userId: "", items: [item] } as Cart });
          return;
        }

        set({
          cart: {
            ...currentCart,
            items: [...currentCart.items, item],
          },
        });
      },

      removeItem: (itemId) => {
        const currentCart = get().cart;
        if (!currentCart) return;

        set({
          cart: {
            ...currentCart,
            items: currentCart.items.filter((i) => i._id !== itemId),
          },
        });
      },

      updateItemQuantity: (itemId, quantity) => {
        const currentCart = get().cart;
        if (!currentCart) return;

        set({
          cart: {
            ...currentCart,
            items: currentCart.items.map((i) =>
              i._id === itemId ? { ...i, quantity } : i
            ),
          },
        });
      },
    }),
    {
      name: "cart-storage", // key trong localStorage
    }
  )
);
