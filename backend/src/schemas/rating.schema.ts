import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Rating extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  book: Types.ObjectId;

  @Prop({
    type: {
      rarity: { type: String, required: false },
      price: { type: Number, required: false },
      image: { type: String, required: false },
    },
    required: false,
    _id: false,
  })
  variant?: {
    rarity?: string;
    price?: number;
    image?: string;
  };

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  stars: number;

  @Prop()
  comment?: string;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
