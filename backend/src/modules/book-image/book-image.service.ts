import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBookImageDto, UpdateBookImageDto } from './dto/book-image.dto';
import { Book } from 'src/schemas/book.schema';

@Injectable()
export class BookImageService {
  constructor(@InjectModel(Book.name) private bookModel: Model<Book>) {}

  async addImage(bookId: string, dto: CreateBookImageDto) {
    const book = await this.bookModel.findById(bookId);
    if (!book) throw new NotFoundException('Book not found');

    if (book.images.length >= 5) {
      throw new Error('Book already has 5 images');
    }

    book.images.push(dto as any);
    await book.save();
    return book;
  }

  async updateImage(
    bookId: string,
    imageIndex: number,
    dto: UpdateBookImageDto,
  ) {
    const result = await this.bookModel.updateOne(
      { _id: bookId },
      { $set: { [`images.${imageIndex}`]: dto } },
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException('Book not found');
    }
    if (result.modifiedCount === 0) {
      throw new NotFoundException('Image not found or no changes applied');
    }

    return await this.bookModel.findById(bookId);
  }

  async removeImage(bookId: string, imageIndex: number) {
    const book = await this.bookModel.findById(bookId);
    if (!book) throw new NotFoundException('Book not found');
    if (!book.images[imageIndex])
      throw new NotFoundException('Image not found');

    book.images.splice(imageIndex, 1);
    await book.save();
    return book;
  }
}
