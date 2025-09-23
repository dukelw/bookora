import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
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
  finalPrice: number; // giá sau giảm
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];

  @Prop({ default: 0 })
  totalAmount: number;

  @Prop({ default: 0 })
  discountAmount: number;

  @Prop({ default: 0 })
  finalAmount: number;

  @Prop({ default: OrderStatus.PENDING, enum: OrderStatus })
  status: OrderStatus;

  @Prop({ type: String, required: false })
  discountCode?: string;

  @Prop({ type: String, required: true })
  user: string; // optional, vẫn lưu để link với user nếu muốn
}

export const OrderSchema = SchemaFactory.createForClass(Order);
