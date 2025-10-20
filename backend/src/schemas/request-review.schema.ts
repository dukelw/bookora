import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ReviewRequestStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  UNKNOWN = 'unknown',
}

@Schema({ timestamps: true })
export class ReviewRequest extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order: Types.ObjectId; // đơn hàng gốc

  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  book: Types.ObjectId; // sản phẩm cần đánh giá

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId; // người mua

  @Prop({ required: true })
  variantId: string; // biến thể cụ thể (nếu có)

  @Prop({ enum: ReviewRequestStatus, default: ReviewRequestStatus.PENDING })
  status: ReviewRequestStatus; // chờ đánh giá / đã đánh giá

  @Prop()
  ratingId?: Types.ObjectId; // nếu đã tạo đánh giá, lưu reference tới Rating
}

export const ReviewRequestSchema = SchemaFactory.createForClass(ReviewRequest);
