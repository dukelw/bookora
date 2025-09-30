import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Discount extends Document {
  @Prop({ required: true, unique: true, length: 5 })
  code: string;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true, default: 10 })
  usageLimit: number;

  @Prop({ default: 0 })
  usedCount: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Order' }], default: [] })
  orders: Types.ObjectId[];
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);

