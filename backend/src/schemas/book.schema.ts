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
export class BookVariant extends Document {
  @Prop({ required: true })
  rarity: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  image: string;

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
  slug: string;

  @Prop()
  author: string;

  @Prop()
  publisher: string;

  @Prop({ type: [Types.ObjectId], ref: 'Category', required: true })
  category: Types.ObjectId[];

  @Prop()
  description: string;

  @Prop()
  price: number; // VND

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

// --- Pre-save hook tự tạo slug ---
BookSchema.pre<Book>('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title);
  }
  next();
});

// --- Hàm slugify ---
function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD') // tách các dấu
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // thay ký tự lạ thành -
    .replace(/^-+|-+$/g, ''); // bỏ dấu - đầu cuối
}
