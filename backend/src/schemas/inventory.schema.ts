import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Inventory extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  book: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'BookVariant', required: true })
  variant: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unitPrice: number;

  @Prop()
  totalPrice: number;

  @Prop({ type: Types.ObjectId, ref: 'PurchaseInvoice', required: true })
  purchaseInvoice: Types.ObjectId;

  @Prop()
  note: string;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
