export interface WishlistBook {
  _id: string;
  title: string;
  slug?: string;
  author?: string;
  publisher?: string;
  price?: number;
  releaseYear?: number;
  mainImage?: string | null;
}

export default interface WishlistItem {
  wishlistId: string;     // id bản ghi wishlist
  addedAt: string;        // createdAt
  book: WishlistBook;     // thông tin sách (đã lookup)
}
