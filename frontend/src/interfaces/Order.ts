import OrderItem from "./OrderItem";
import ShippingAddress from "./ShippingAddress";

export interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: string;
  user: string;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  cart: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
