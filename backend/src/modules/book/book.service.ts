import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Book } from 'src/schemas/book.schema';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<Book>,
  ) {}

  async create(dto: CreateBookDto): Promise<Book> {
    const book = new this.bookModel(dto);
    return book.save();
  }

  async findAll(searchKey?: string, page = 1, limit = 10) {
    const filter: any = {};

    if (searchKey) {
      filter.$or = [
        { title: { $regex: searchKey, $options: 'i' } },
        { author: { $regex: searchKey, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.bookModel
        .find(filter)
        .populate('category')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookModel.findById(id).populate('category').exec();
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async update(id: string, dto: UpdateBookDto): Promise<Book> {
    const updated = await this.bookModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Book not found');
    return updated;
  }

  async remove(id: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }

    const result = await this.bookModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Book not found');
    return result;
  }

  async findByCategory(categoryId: string, page = 1, limit = 10): Promise<any> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.bookModel
        .find({ category: categoryId })
        .populate('category')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookModel.countDocuments({ category: categoryId }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
