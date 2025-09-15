import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookImageService } from './book-image.service';
import { BookImageController } from './book-image.controller';
import { Book, BookSchema } from 'src/schemas/book.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
  ],
  controllers: [BookImageController],
  providers: [BookImageService],
})
export class BookImageModule {}
