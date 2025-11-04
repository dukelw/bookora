import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Order, OrderSchema } from 'src/schemas/order.schema';
import {
  LoyaltyTransaction,
  LoyaltyTransactionSchema,
} from 'src/schemas/loyalty-transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
      { name: LoyaltyTransaction.name, schema: LoyaltyTransactionSchema },
    ]),
  ],
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
