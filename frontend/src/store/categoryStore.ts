/* eslint-disable @typescript-eslint/no-explicit-any */
import { Category } from "@/interfaces/Book";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CategoryState = {
  category: Category | null;
  categoryId: string | null;
  setCategory: (category: Category, categoryId?: string) => void;
  setCategoryId: (categoryId: string) => void;
  clearCategory: () => void;
};

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set) => ({
      category: null,
      categoryId: null,
      setCategory: (category, categoryId) => set({ category, categoryId: categoryId || category._id }),
      setCategoryId: (categoryId) => set({ categoryId }),
      clearCategory: () => set({ category: null, categoryId: null }),
    }),
    {
      name: "category-storage",
    }
  )
);
