import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserDocument = User & Document & { _id: mongoose.Types.ObjectId };

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  address: string;

  @Prop()
  name: string;

  @Prop()
  avatar: string;

  @Prop()
  shippingAddress: string;

  @Prop({ type: [String], default: [] })
  usedRefreshTokens: string[];

  @Prop()
  otp?: string;

  @Prop()
  otpExpiresAt?: Date;

  @Prop({ type: Number, default: 0 })
  otpAttempts?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
