import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PromotionDocument = Promotion & Document;

@Schema({ timestamps: true })
export class Promotion {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  discount: number; // ví dụ 0.2 = 20%

  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  productIds: Types.ObjectId[];

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
