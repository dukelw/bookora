import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RarityType } from 'src/constant';

@Schema()
export class BookImage {
  @Prop({ required: true })
  url: string;

  @Prop({ default: false })
  isMain: boolean;

  @Prop({ default: 0 })
  order: number; // 1–5
}

@Schema()
export class BookVariant {
  @Prop({ required: true, enum: RarityType })
  rarity: RarityType;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: 0 })
  stock: number;

  @Prop()
  isbn: string;
}

@Schema({ timestamps: true })
export class Book extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  author: string;

  @Prop()
  publisher: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop()
  description: string;

  @Prop()
  releaseYear: number;

  // Mảng ảnh
  @Prop({
    type: [BookImage],
    validate: [
      (val: BookImage[]) => val.length >= 5,
      'Book must have at least 5 images',
    ],
  })
  images: BookImage[];

  // Mảng biến thể
  @Prop({ type: [BookVariant], default: [] })
  variants: BookVariant[];
}

export const BookSchema = SchemaFactory.createForClass(Book);
