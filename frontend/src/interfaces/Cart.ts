import CartItem from "./CartItem";

export default interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}
