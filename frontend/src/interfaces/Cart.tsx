import { Book } from "./Book";

export enum CartItemStatus {
  PENDING = "pending", // chưa mua
  PURCHASED = "purchased", // đã đánh dấu để mua
}

export interface CartItem {
  _id: string;
  book: Book; // khi populate thì là Book, nếu chưa populate thì chỉ là id
  variantId: string;
  quantity: number;
  status: CartItemStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}
