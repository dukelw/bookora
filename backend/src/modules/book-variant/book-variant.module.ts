import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookVariantService } from './book-variant.service';
import { BookVariantController } from './book-variant.controller';
import { Book, BookSchema } from 'src/schemas/book.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
  ],
  controllers: [BookVariantController],
  providers: [BookVariantService],
})
export class BookVariantModule {}
