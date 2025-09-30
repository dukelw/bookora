import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FooterImageDocument = FooterImage & Document;

@Schema({ timestamps: true })
export class FooterImage {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  image: string; // link ảnh

  @Prop()
  link?: string; // link ngoài khi click ảnh

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number; // thứ tự hiển thị
}

export const FooterImageSchema = SchemaFactory.createForClass(FooterImage);
