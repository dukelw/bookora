import { Module } from '@nestjs/common';
import { RatingModule } from './modules/rating/rating.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CloudinaryModule } from './modules/upload/cloudinary/cloudinary.module';
import { MongoDBModule } from './modules/databases/mongodb/mongodb.module';
import { UserModule } from './modules/user/user.module';
import { SliderModule } from './modules/slider/slider.module';
import { CategoryModule } from './modules/category/category.module';
import { BookModule } from './modules/book/book.module';
import { BookVariantModule } from './modules/book-variant/book-variant.module';
import { BookImageModule } from './modules/book-image/book-image.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { PurchaseInvoiceModule } from './modules/purchase-invoice/purchase-invoice.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { DiscountModule } from './modules/discount/discount.module';
import { FooterImageModule } from './modules/footer-image/footer-image.module';
import { MailModule } from './modules/mail/mail.module';
import { MomoModule } from './modules/payment/momo/momo.module';
import { BookoraVnpayModule } from './modules/payment/vnpay/vnpay.module';
import { AddressModule } from './modules/address/address.module';
import { ReviewRequestModule } from './modules/review-request/review-request.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { CommentModule } from './modules/comment/comment.module';
import { BullModule } from '@nestjs/bull';
import { StatisticsModule } from './modules/statistic/statistic.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST') || '127.0.0.1',
          port: parseInt(config.get('REDIS_PORT') || '6379', 10),
          password: config.get('REDIS_PASSWORD') || undefined,
        },
        prefix: config.get('BULL_PREFIX') || 'queues',
        defaultJobOptions: {
          removeOnComplete: 1000,
          removeOnFail: 1000,
        },
      }),
      inject: [ConfigService],
    }),
    MongoDBModule,
    UserModule,
    AuthModule,
    SliderModule,
    CloudinaryModule,
    CategoryModule,
    BookModule,
    BookVariantModule,
    BookImageModule,
    InventoryModule,
    PurchaseInvoiceModule,
    CartModule,
    OrderModule,
    RatingModule,
    DiscountModule,
    FooterImageModule,
    MailModule,
    MomoModule,
    BookoraVnpayModule,
    AddressModule,
    ReviewRequestModule,
    WishlistModule,
    CommentModule,
    StatisticsModule,
  ],
})
export class AppModule {}
