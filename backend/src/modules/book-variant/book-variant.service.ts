import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateBookVariantDto,
  UpdateBookVariantDto,
} from './dto/book-variant.dto';
import { Book } from 'src/schemas/book.schema';

@Injectable()
export class BookVariantService {
  constructor(@InjectModel(Book.name) private bookModel: Model<Book>) {}

  async addVariant(bookId: string, dto: CreateBookVariantDto) {
    const book = await this.bookModel.findById(bookId);
    if (!book) throw new NotFoundException('Book not found');

    book.variants.push(dto as any);
    await book.save();
    return book;
  }

  async updateVariant(
    bookId: string,
    variantIndex: number,
    dto: UpdateBookVariantDto,
  ) {
    const book = await this.bookModel.findById(bookId);
    if (!book) throw new NotFoundException('Book not found');

    if (!book.variants[variantIndex])
      throw new NotFoundException('Variant not found');

    await this.bookModel.updateOne(
      { _id: bookId, 'variants._id': variantIndex },
      { $set: { 'variants.$': dto } },
    );

    await book.save();
    return book;
  }

  async removeVariant(bookId: string, variantIndex: number) {
    const book = await this.bookModel.findById(bookId);
    if (!book) throw new NotFoundException('Book not found');

    if (!book.variants[variantIndex])
      throw new NotFoundException('Variant not found');

    book.variants.splice(variantIndex, 1);
    await book.save();
    return book;
  }
}
