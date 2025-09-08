import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SliderDocument = Slider & Document;

@Schema({ timestamps: true })
export class Slider {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  image: string;

  @Prop({ type: Types.ObjectId, ref: 'SliderCollection', required: true })
  collection: Types.ObjectId;

  @Prop({ default: false })
  isActive: boolean;
}

export const SliderSchema = SchemaFactory.createForClass(Slider);
