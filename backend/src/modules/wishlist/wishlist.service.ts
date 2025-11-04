import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Wishlist } from 'src/schemas/wishlist.schema';
import { Book } from 'src/schemas/book.schema';
import {
  AddWishlistDto,
  BulkWishlistDto,
  WishlistQueryDto,
} from './dto/wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name) private readonly wishlistModel: Model<Wishlist>,
    @InjectModel(Book.name) private readonly bookModel: Model<Book>,
  ) {}

  async list(userId: string, q: WishlistQueryDto) {
    const { page = 1, limit = 12 } = q;
    const uid = new mongoose.Types.ObjectId(userId);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.wishlistModel
        .aggregate([
          { $match: { user: uid } },
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: Math.min(limit, 50) },
          {
            $lookup: {
              from: 'books',
              localField: 'book',
              foreignField: '_id',
              as: 'book',
            },
          },
          { $unwind: '$book' },
          {
            $addFields: {
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
            },
          },
          {
            $project: {
              _id: 0,
              wishlistId: '$_id',
              addedAt: '$createdAt',
              book: {
                _id: '$book._id',
                title: '$book.title',
                slug: '$book.slug',
                author: '$book.author',
                publisher: '$book.publisher',
                price: '$book.price',
                releaseYear: '$book.releaseYear',
                mainImage: '$mainImage',
              },
            },
          },
        ])
        .exec(),
      this.wishlistModel.countDocuments({ user: uid }),
    ]);

    return {
      items,
      meta: {
        page,
        limit: Math.min(limit, 50),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async add(userId: string, dto: AddWishlistDto) {
    const uid = new mongoose.Types.ObjectId(userId);
    const bid = new mongoose.Types.ObjectId(dto.bookId);

    const exists = await this.bookModel.exists({ _id: bid });
    if (!exists) throw new NotFoundException('Book not found');

    try {
      const doc = await this.wishlistModel.create({ user: uid, book: bid });
      return { success: true, id: doc._id };
    } catch (e: any) {
      if (e?.code === 11000) {
        // duplicate key (already in wishlist)
        throw new ConflictException('Book already in wishlist');
      }
      throw e;
    }
  }

  async addMany(userId: string, dto: BulkWishlistDto) {
    const uid = new mongoose.Types.ObjectId(userId);
    const bids = dto.bookIds.map((id) => new mongoose.Types.ObjectId(id));

    // lọc bỏ book đã có trong wishlist để không lỗi unique
    const existing = await this.wishlistModel
      .find({ user: uid, book: { $in: bids } }, { book: 1 })
      .lean();
    const existingIds = new Set(existing.map((d) => d.book.toString()));
    const toInsert = bids
      .filter((id) => !existingIds.has(id.toString()))
      .map((book) => ({ user: uid, book }));
    if (!toInsert.length) return { success: true, inserted: 0 };

    await this.wishlistModel.insertMany(toInsert);
    return { success: true, inserted: toInsert.length };
  }

  async remove(userId: string, bookId: string) {
    const uid = new mongoose.Types.ObjectId(userId);
    const bid = new mongoose.Types.ObjectId(bookId);
    await this.wishlistModel.deleteOne({ user: uid, book: bid }).exec();
    return { success: true };
  }

  async removeMany(userId: string, dto: BulkWishlistDto) {
    const uid = new mongoose.Types.ObjectId(userId);
    const bids = dto.bookIds.map((id) => new mongoose.Types.ObjectId(id));
    const res = await this.wishlistModel
      .deleteMany({ user: uid, book: { $in: bids } })
      .exec();
    return { success: true, deleted: res.deletedCount ?? 0 };
  }

  async toggle(userId: string, dto: AddWishlistDto) {
    const uid = new mongoose.Types.ObjectId(userId);
    const bid = new mongoose.Types.ObjectId(dto.bookId);
    const found = await this.wishlistModel
      .findOne({ user: uid, book: bid })
      .lean()
      .exec();
    if (found) {
      await this.wishlistModel.deleteOne({ _id: found._id }).exec();
      return { inWishlist: false };
    } else {
      await this.add(userId, dto);
      return { inWishlist: true };
    }
  }

  async status(userId: string, bookId: string) {
    const uid = new mongoose.Types.ObjectId(userId);
    const bid = new mongoose.Types.ObjectId(bookId);
    const found = await this.wishlistModel.exists({ user: uid, book: bid });
    return { inWishlist: !!found };
  }

  async clear(userId: string) {
    const uid = new mongoose.Types.ObjectId(userId);
    await this.wishlistModel.deleteMany({ user: uid }).exec();
    return { success: true };
  }
}
