/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import User from "~/models/User";

type AuthState = {
  user: User | null;
  tokens: any;
  setUser: (user: any) => void;
  setTokens: (tokens: any) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      setUser: (user) => set({ user }),
      setTokens: (tokens) => set({ tokens }),
    }),
    {
      name: "auth-storage",
    }
  )
);
