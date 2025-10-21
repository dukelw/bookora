import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DiscountDocument = Discount & Document;

export enum DiscountType {
  PERCENTAGE = 'percentage',
  AMOUNT = 'amount',
}

@Schema({ timestamps: true })
export class Discount extends Document {
  @Prop({ required: true, unique: true, length: 5 })
  code: string;

  @Prop({ required: true })
  value: number;

  @Prop({ type: String, enum: DiscountType, required: true })
  type: DiscountType;

  @Prop({ required: true, default: 10 })
  usageLimit: number;

  @Prop({ default: 0 })
  usedCount: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Order' }], default: [] })
  orders: Types.ObjectId[];

  @Prop({ default: false })
  active: boolean;
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);
