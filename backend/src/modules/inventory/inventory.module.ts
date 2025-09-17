import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchaseInvoiceModule } from '../purchase-invoice/purchase-invoice.module';
import { BookModule } from '../book/book.module';
import { Inventory, InventorySchema } from 'src/schemas/inventory.schema';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
    ]),
    PurchaseInvoiceModule,
    BookModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
