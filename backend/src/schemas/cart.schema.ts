import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CartItemStatus {
  PENDING = 'pending', // chưa mua
  PURCHASED = 'purchased', // đã đánh dấu để mua
}

@Schema({ timestamps: true })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  book: Types.ObjectId;

  @Prop({ required: true })
  variantId: string;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ default: CartItemStatus.PENDING, enum: CartItemStatus })
  status: CartItemStatus;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ type: String, required: true, unique: true })
  userId: string; // có thể là userId thật hoặc guestId

  @Prop({ type: [CartItem], default: [] })
  items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
