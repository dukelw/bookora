import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BookToRate {
  bookId: string;
  title: string;
  slug: string;
  thumbnail?: string;
}

interface RatingStore {
  booksToRate: BookToRate[];
  currentBookToRate: BookToRate | null;
  setBooksToRate: (books: BookToRate[]) => void;
  clearBooksToRate: () => void;
  setCurrentBookToRate: (book: BookToRate) => void;
  clearBookToRate: (bookId: string) => void; 
}

export const useRatingStore = create<RatingStore>((set) => ({
  booksToRate: [],
  currentBookToRate: null,
  setBooksToRate: (books) => set({ booksToRate: books }),
  clearBooksToRate: () => set({ booksToRate: [] }),
  setCurrentBookToRate: (book) => set({ currentBookToRate: book }),
  clearBookToRate: (bookId) =>
    set((state) => ({
      booksToRate: state.booksToRate.filter((b) => b.bookId !== bookId),
    })),
}));
