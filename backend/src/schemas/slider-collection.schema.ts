import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SliderCollectionDocument = SliderCollection & Document;

@Schema({ timestamps: true })
export class SliderCollection {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Slider' }], default: [] })
  sliders: Types.ObjectId[];

  @Prop({ default: false })
  isActive: boolean;
}

export const SliderCollectionSchema =
  SchemaFactory.createForClass(SliderCollection);
