import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CloudinaryModule } from './modules/upload/cloudinary/cloudinary.module';
import { MongoDBModule } from './modules/databases/mongodb/mongodb.module';
import { UserModule } from './modules/user/user.module';
import { SliderModule } from './modules/slider/slider.module';
import { CategoryModule } from './modules/category/category.module';
import { BookModule } from './modules/book/book.module';
import { BookVariantModule } from './modules/book-variant/book-variant.module';
import { BookImageModule } from './modules/book-image/book-image.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongoDBModule,
    UserModule,
    AuthModule,
    SliderModule,
    CloudinaryModule,
    CategoryModule,
    BookModule,
    BookVariantModule,
    BookImageModule,
  ],
})
export class AppModule {}
