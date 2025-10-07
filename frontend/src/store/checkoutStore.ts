/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CheckoutState = {
  checkout: any;
  setCheckout: (checkout: any) => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      checkout: null,
      setCheckout: (checkout) => set({ checkout }),
    }),
    {
      name: "checkout-storage",
    }
  )
);
