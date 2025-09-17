import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchaseInvoiceService } from './purchase-invoice.service';
import {
  PurchaseInvoice,
  PurchaseInvoiceSchema,
} from 'src/schemas/purchase-invoice.schema';
import { PurchaseInvoiceController } from './purchase-invoice.controller';
import { Inventory, InventorySchema } from 'src/schemas/inventory.schema';
import { Book, BookSchema } from 'src/schemas/book.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PurchaseInvoice.name, schema: PurchaseInvoiceSchema },
      { name: Inventory.name, schema: InventorySchema },
      { name: Book.name, schema: BookSchema },
    ]),
  ],
  controllers: [PurchaseInvoiceController],
  providers: [PurchaseInvoiceService],
  exports: [PurchaseInvoiceService],
})
export class PurchaseInvoiceModule {}
