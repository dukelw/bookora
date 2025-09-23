/* eslint-disable @typescript-eslint/no-explicit-any */
import { Book } from "@/interfaces/Book";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type BookState = {
  book: Book | null;
  bookId: string | null;
  setBook: (book: Book, bookId?: string) => void;
  setBookId: (bookId: string) => void;
  clearBook: () => void;
};

export const useBookStore = create<BookState>()(
  persist(
    (set) => ({
      book: null,
      bookId: null,
      setBook: (book, bookId) => set({ book, bookId: bookId || book._id }),
      setBookId: (bookId) => set({ bookId }),
      clearBook: () => set({ book: null, bookId: null }),
    }),
    {
      name: "book-storage",
    }
  )
);
