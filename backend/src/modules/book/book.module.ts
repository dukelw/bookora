import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from 'src/schemas/book.schema';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { RatingModule } from '../rating/rating.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    RatingModule,
  ],
  providers: [BookService],
  controllers: [BookController],
  exports: [MongooseModule],
})
export class BookModule {}
