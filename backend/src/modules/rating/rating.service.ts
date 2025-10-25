import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rating } from 'src/schemas/rating.schema';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Types } from 'mongoose';
import { RealtimeGateway } from 'src/gateway/realtime.gateway';

@Injectable()
export class RatingService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<Rating>,
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
