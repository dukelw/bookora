import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Wishlist extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  book: Types.ObjectId;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);

// 1 user – 1 book chỉ 1 bản ghi
WishlistSchema.index({ user: 1, book: 1 }, { unique: true });
