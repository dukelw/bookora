import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PurchaseInvoice extends Document {
  @Prop({ required: true })
  invoiceNumber: string;

  @Prop({ required: true })
  supplier: string;

  @Prop({ default: Date.now })
  invoiceDate: Date;

  @Prop()
  totalAmount: number; // tổng tiền cả lô (tính tự động)

  @Prop()
  note: string;
}

export const PurchaseInvoiceSchema =
  SchemaFactory.createForClass(PurchaseInvoice);
