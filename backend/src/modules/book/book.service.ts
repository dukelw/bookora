import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types} from 'mongoose';
import { Book } from 'src/schemas/book.schema';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';
import { RatingService } from '../rating/rating.service';
import { BestSellersQueryDto } from './dto/book-bestsellers.dto';
import { NewReleasesQueryDto } from './dto/book-newreleases.dto';
import { Order, OrderStatus } from 'src/schemas/order.schema';
@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<Book>,
    private readonly ratingService: RatingService,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
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

  async getBookWithRatings(bookId: string) {
    const book = await this.bookModel.findById(bookId).lean();
    const avg = await this.ratingService.getAverageRating(bookId);
    return { ...book, averageRating: avg.avgStars, totalRatings: avg.count };
  }

  // BEST SELLERS via aggregation from orders
  async getBestSellers(q: BestSellersQueryDto) {
    const {
      limit = 12,
      from,
      to,
      category,
      author,
      publisher,
      includeOutOfStock = 'false',
    } = q;

    const matchOrder: any = {
      status: { $in: [OrderStatus.PAID, OrderStatus.SHIPPED] },
    };
    if (from || to) {
      matchOrder.createdAt = {};
      if (from) matchOrder.createdAt.$gte = new Date(from);
      if (to)   matchOrder.createdAt.$lte = new Date(to);
    }

    const pipeline: any[] = [
      { $match: matchOrder },
      { $unwind: '$items' },
      // gom theo book để tính tổng sold
      {
        $group: {
          _id: '$items.book',
          sold: { $sum: '$items.quantity' },
          lastOrderAt: { $max: '$createdAt' },
        },
      },
      // join sang books
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
    ];

    // filter theo category/author/publisher nếu có
    const bookMatch: any = {};
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      bookMatch['book.category'] = new mongoose.Types.ObjectId(category);
    }
    if (author) bookMatch['book.author'] = author;
    if (publisher) bookMatch['book.publisher'] = publisher;
    if (Object.keys(bookMatch).length) pipeline.push({ $match: bookMatch });

    // tính mainImage & tổng stock để lọc out-of-stock
    pipeline.push(
      {
        $addFields: {
          // mainImage: lấy ảnh có isMain=true, fallback ảnh đầu
          mainImageArr: {
            $filter: {
              input: '$book.images',
              as: 'img',
              cond: { $eq: ['$$img.isMain', true] },
            },
          },
        },
      },
      {
        $addFields: {
          mainImage: {
            $cond: [
              { $gt: [{ $size: '$mainImageArr' }, 0] },
              { $arrayElemAt: ['$mainImageArr.url', 0] },
              { $arrayElemAt: ['$book.images.url', 0] },
            ],
          },
          totalStock: { $sum: '$book.variants.stock' },
        },
      },
    );

    // exclude out-of-stock nếu không cho phép
    if (includeOutOfStock !== 'true') {
      pipeline.push({ $match: { totalStock: { $gt: 0 } } });
    }

    // sort & project
    pipeline.push(
      { $sort: { sold: -1, lastOrderAt: -1 } },
      { $limit: Math.min(limit, 50) },
      {
        $project: {
          _id: '$book._id',
          title: '$book.title',
          slug: '$book.slug',
          author: '$book.author',
          publisher: '$book.publisher',
          price: '$book.price',
          releaseYear: '$book.releaseYear',
          mainImage: 1,
          sold: 1,
        },
      },
    );

    const items = await this.orderModel.aggregate(pipeline).exec();
    return { items, meta: { count: items.length, limit: Math.min(limit, 50) } };
  }

  // NEW RELEASES via releaseYear
  async getNewReleases(q: NewReleasesQueryDto) {
    const { limit = 12, year, category, author, publisher } = q;

    const filter: any = {};
    if (year) filter.releaseYear = year;
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = new mongoose.Types.ObjectId(category);
    }
    if (author) filter.author = author;
    if (publisher) filter.publisher = publisher;

    const docs = await this.bookModel
      .find(filter)
      .sort({ releaseYear: -1, createdAt: -1 })
      .limit(Math.min(limit, 50))
      .lean()
      .exec();

    // map thêm mainImage (computed)
    const items = docs.map((b: any) => {
      const main = (b.images || []).find((i: any) => i.isMain)?.url || b.images?.[0]?.url;
      return {
        _id: b._id,
        title: b.title,
        slug: b.slug,
        author: b.author,
        publisher: b.publisher,
        price: b.price,
        releaseYear: b.releaseYear,
        mainImage: main || null,
      };
    });

    return { items, meta: { count: items.length, limit: Math.min(limit, 50) } };
  }
}
