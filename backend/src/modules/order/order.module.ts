import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModule } from '../cart/cart.module';
import { Order, OrderSchema } from 'src/schemas/order.schema';
import { DiscountModule } from '../discount/discount.module';
import { Book, BookSchema } from 'src/schemas/book.schema';
import { ReviewRequestModule } from '../review-request/review-request.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Book.name, schema: BookSchema },
    ]),
    CartModule,
    DiscountModule,
    ReviewRequestModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
