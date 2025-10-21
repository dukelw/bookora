import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CartItemStatus {
  PENDING = 'pending',
  PURCHASED = 'purchased',
}

@Schema({ timestamps: true })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  book: Types.ObjectId; // khi populate -> Book document

  @Prop({ required: true })
  variantId: string;

  @Prop({ default: 1 })
  quantity: number;

  @Prop({ default: CartItemStatus.PENDING, enum: CartItemStatus })
  status: CartItemStatus;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ type: String, required: false, index: true })
  guestId?: string;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// IMPORTANT: create unique index for userId only when userId exists
CartSchema.index(
  { userId: 1 },
  {
    unique: true,
    partialFilterExpression: { userId: { $exists: true, $ne: null } },
  },
);
