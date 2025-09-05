import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true })
  price: number;

  @Prop()
  oldPrice: number;

  @Prop({ type: MongooseSchema.Types.Mixed })
  specs: Record<string, any>; // JSON: thông số kỹ thuật

  @Prop()
  description: string;

  @Prop({ default: 0 })
  stock: number;

  @Prop({ default: 0 })
  sold: number;

  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  relatedProducts: Types.ObjectId[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
