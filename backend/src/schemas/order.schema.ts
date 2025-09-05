import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];

  @Prop()
  total: number;

  @Prop({ default: 'pending' })
  status: string; // pending, confirmed, shipped, delivered, cancelled

  @Prop()
  shippingAddress: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
