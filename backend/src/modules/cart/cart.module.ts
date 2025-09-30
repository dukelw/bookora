import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Book, BookSchema } from 'src/schemas/book.schema';
import { Cart, CartSchema } from 'src/schemas/cart.schema';
import { DiscountModule } from '../discount/discount.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Book.name, schema: BookSchema },
    ]),
    DiscountModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
