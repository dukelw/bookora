import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  ageRange: string; // ví dụ "6-12", "18+"

  @Prop()
  slug: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// --- Pre-save hook tự tạo slug ---
CategorySchema.pre<Category>('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

// --- Hàm slugify tái sử dụng từ Book ---
function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD') // tách dấu
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // thay ký tự lạ bằng -
    .replace(/^-+|-+$/g, ''); // bỏ dấu - đầu/cuối
}
