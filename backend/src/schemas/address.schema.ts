import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum AddressType {
  HOME = 'home',
  OFFICE = 'office',
}

@Schema({ timestamps: true })
export class Address extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  // 1) Họ và tên
  @Prop({ required: true, trim: true })
  fullName: string;

  // 2) Số điện thoại
  @Prop({ required: true, trim: true })
  phone: string;

  // 3) Địa chỉ (tỉnh/thành, quận/huyện, phường/xã, địa chỉ cụ thể)
  @Prop({ required: true }) province: string;
  @Prop({ required: true }) district: string;
  @Prop({ required: true }) ward: string;
  @Prop({ required: true }) addressLine1: string;

  // 4) Loại địa chỉ
  @Prop({ required: true, enum: AddressType })
  addressType: AddressType;

  // 5) Mặc định?
  @Prop({ default: false })
  isDefault: boolean;

  // quản trị
  @Prop({ default: true })
  active: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

AddressSchema.index({ userId: 1, isDefault: 1 });
AddressSchema.index({ userId: 1, active: 1, updatedAt: -1 });
