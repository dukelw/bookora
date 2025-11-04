import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LoyaltyTransactionDocument = LoyaltyTransaction & Document;

export enum LoyaltyTxType {
  EARN = 'earn',
  REDEEM = 'redeem',
  REFUND = 'refund',
}

@Schema({ timestamps: true })
export class LoyaltyTransaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: false })
  order?: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(LoyaltyTxType), required: true })
  type: LoyaltyTxType;

  @Prop({ type: Number, required: true })
  points: number; // + / - đã chuẩn hoá ở service (đều lưu dương)

  @Prop({ type: Number, default: 0 })
  amountVnd?: number; // giá trị VND quy chiếu (earn/redeem)

  @Prop()
  note?: string;
}
export const LoyaltyTransactionSchema = SchemaFactory.createForClass(LoyaltyTransaction);
