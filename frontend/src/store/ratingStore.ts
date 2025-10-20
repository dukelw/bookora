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
  reviewRequest: string;
  currentBookToRate: BookToRate | null;
  setReviewRequest: (reviewRequestId: string) => void;
  setBooksToRate: (books: BookToRate[]) => void;
  clearBooksToRate: () => void;
  setCurrentBookToRate: (book: BookToRate) => void;
  clearBookToRate: (bookId: string) => void;
}

export const useRatingStore = create<RatingStore>()(
  persist(
    (set) => ({
      reviewRequest: "",
      booksToRate: [],
      currentBookToRate: null,

      setReviewRequest: (reviewRequestId) =>
        set({ reviewRequest: reviewRequestId }),

      setBooksToRate: (books) => set({ booksToRate: books }),

      clearBooksToRate: () => set({ booksToRate: [] }),

      setCurrentBookToRate: (book) => set({ currentBookToRate: book }),

      clearBookToRate: (bookId) =>
        set((state) => ({
          booksToRate: state.booksToRate.filter((b) => b.bookId !== bookId),
        })),
    }),
    {
      name: "rating-storage",
    }
  )
);
