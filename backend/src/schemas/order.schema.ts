import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  CANCELLED = 'cancelled',
}

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  book: Types.ObjectId;

  @Prop({ required: true })
  variantId: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number; // giá gốc

  @Prop({ required: true })
  finalPrice: number; // giá sau khi áp dụng discount (nếu có)
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];

  @Prop({ default: 0 })
  totalAmount: number; // tổng tiền trước giảm

  @Prop({ default: 0 })
  discountAmount: number; // số tiền được giảm

  @Prop({ default: 0 })
  finalAmount: number; // tổng tiền sau khi giảm

  @Prop({ default: OrderStatus.PENDING, enum: OrderStatus })
  status: OrderStatus;

  @Prop({ type: String, required: false })
  discountCode?: string; // mã giảm giá (nếu có)

  @Prop({ type: String, required: true })
  user: string; // ID user đặt đơn

  @Prop({ type: Object, required: true })
  shippingAddress: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    note?: string;
  };

  @Prop({ type: String, required: true })
  paymentMethod: string; // cod, vnpay, etc.

  @Prop({ type: Types.ObjectId, ref: 'Cart', required: true })
  cart: Types.ObjectId;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
