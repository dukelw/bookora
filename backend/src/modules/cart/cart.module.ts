import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Book, BookSchema } from 'src/schemas/book.schema';
import { Cart, CartSchema } from 'src/schemas/cart.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Book.name, schema: BookSchema },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
