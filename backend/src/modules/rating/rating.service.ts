import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Rating } from 'src/schemas/rating.schema';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Types } from 'mongoose';
import { RealtimeGateway } from 'src/gateway/realtime.gateway';
import { Book } from 'src/schemas/book.schema';
import { ReviewRequest } from 'src/schemas/request-review.schema';

@Injectable()
export class RatingService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<Rating>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @InjectModel(ReviewRequest.name)
    private reviewRequestModel: Model<ReviewRequest>,
    private readonly ratingGateway: RealtimeGateway,
  ) {}

  async getUserRating(bookId: string, userId: string) {
    return this.ratingModel.findOne({
      book: new Types.ObjectId(bookId),
      user: new Types.ObjectId(userId),
    });
  }

  async addRating(bookId: string, userId: string, dto: CreateRatingDto) {
    try {
      const rating = await this.ratingModel.create({
        book: new Types.ObjectId(bookId),
        user: new Types.ObjectId(userId),
        ...dto,
      });
      this.ratingGateway.sendRatingUpdate(bookId, rating);
      return rating;
    } catch (err) {
      console.error('Error in addRating:', err);
      throw err;
    }
  }

  async updateRating(bookId: string, userId: string, dto: CreateRatingDto) {
    const rating = await this.ratingModel.findOneAndUpdate(
      { book: new Types.ObjectId(bookId), user: new Types.ObjectId(userId) },
      { $set: { ...dto } },
      { new: true },
    );

    if (!rating) {
      throw new NotFoundException('Rating not found for this user and book');
    }

    this.ratingGateway.sendRatingUpdate(bookId, rating);
    return rating;
  }

  async getRatings(
    bookId: string,
    page?: number | string,
    limit?: number | string,
  ) {
    const filter = { book: new Types.ObjectId(bookId) };

    const hasPagination = page !== undefined || limit !== undefined; // <-- ADD

    if (!hasPagination) {
      return this.ratingModel
        .find(filter)
        .populate({ path: 'user', select: 'fullname email name avatar' })
        .sort({ createdAt: -1 });
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(limit) || 10));
    const skip = (pageNum - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.ratingModel
        .find(filter)
        .populate({ path: 'user', select: 'fullname email name avatar' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean()
        .exec(),
      this.ratingModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // NEW: get rating by userId + bookId + variantId, return rich data
  async getUserVariantRating(
    bookId: string,
    variantId: string,
    userId: string,
  ) {
    const bookObjectId = new Types.ObjectId(bookId);
    const userObjectId = new Types.ObjectId(userId);

    // 1) Tìm ReviewRequest -> nếu có ratingId thì dùng luôn
    const rr = await this.reviewRequestModel
      .findOne({ book: bookObjectId, user: userObjectId, variantId })
      .lean()
      .exec();

    let ratingDoc: any = null;
    if (rr?.ratingId) {
      ratingDoc = await this.ratingModel.findById(rr.ratingId).lean().exec();
    }

    // 2) Lấy book + variant để hiển thị và dùng fallback nếu chưa có ratingDoc
    const book = await this.bookModel.findById(bookObjectId).lean().exec();
    if (!book) throw new NotFoundException('Book not found');

    // Tìm biến thể theo _id (ObjectId) hoặc fallback theo isbn
    const tryObjectId = isValidObjectId(variantId)
      ? new Types.ObjectId(variantId)
      : null;
    const variant =
      (tryObjectId
        ? (book.variants || []).find(
            (v: any) => v?._id?.toString() === tryObjectId.toString(),
          )
        : null) ||
      (book.variants || []).find((v: any) => v?.isbn && v.isbn === variantId);

    if (!variant) {
      throw new NotFoundException('Variant not found for this book');
    }

    // 3) Fallback tìm rating theo dữ liệu variant (vì Rating không lưu variantId)
    if (!ratingDoc) {
      ratingDoc = await this.ratingModel
        .findOne({
          book: bookObjectId,
          user: userObjectId,
          // match theo các thuộc tính đã lưu trong Rating.variant
          ...(variant.rarity ? { 'variant.rarity': variant.rarity } : {}),
          ...(variant.price !== undefined
            ? { 'variant.price': variant.price }
            : {}),
          ...(variant.image ? { 'variant.image': variant.image } : {}),
        })
        .lean()
        .exec();
    }

    // 4) Chuẩn hoá dữ liệu trả về
    const result = {
      book: {
        _id: book._id,
        title: (book as any).title,
        slug: (book as any).slug,
        author: (book as any).author,
        publisher: (book as any).publisher,
        images: (book as any).images,
      },
      variant: {
        _id: (variant as any)._id,
        rarity: (variant as any).rarity,
        price: (variant as any).price,
        image: (variant as any).image,
        stock: (variant as any).stock,
        isbn: (variant as any).isbn,
      },
      rating: ratingDoc
        ? {
            _id: ratingDoc._id,
            stars: ratingDoc.stars,
            comment: ratingDoc.comment ?? null,
            user: ratingDoc.user,
            createdAt: (ratingDoc as any).createdAt,
            updatedAt: (ratingDoc as any).updatedAt,
          }
        : null,
      reviewRequest: rr
        ? {
            _id: rr._id,
            status: rr.status,
            ratingId: rr.ratingId ?? null,
          }
        : null,
    };

    return result;
  }

  async getAverageRating(bookId: string) {
    const result = await this.ratingModel.aggregate([
      { $match: { book: new Types.ObjectId(bookId) } },
      {
        $group: {
          _id: null,
          avgStars: { $avg: '$stars' },
          count: { $sum: 1 },
        },
      },
    ]);
    return result[0] || { avgStars: 0, count: 0 };
  }
}
