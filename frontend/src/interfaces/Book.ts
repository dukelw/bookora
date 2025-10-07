import BookImage from "./BookImage";
import Category from "./Category";

export default interface Book {
  _id: string;
  title: string;
  slug: string;
  author: string;
  publisher: string;
  category: Category[];
  price: number;
  releaseYear: number;
  stock: number;
  description?: string;
  images?: BookImage[];
  variants?: any[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}
