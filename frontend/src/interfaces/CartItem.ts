import { CartItemStatus } from "@/enums";
import Book from "./Book";

export default interface CartItem {
  _id: string;
  book: Book; // khi populate thì là Book, nếu chưa populate thì chỉ là id
  variantId: string;
  quantity: number;
  status: CartItemStatus;
  createdAt?: string;
  updatedAt?: string;
}
