import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parent: Types.ObjectId;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  icon: string;

  @Prop()
  order: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
