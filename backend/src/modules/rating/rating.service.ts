import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rating } from 'src/schemas/rating.schema';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingGateway } from './rating.gateway';
import { Types } from 'mongoose';

@Injectable()
export class RatingService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<Rating>,
    private readonly ratingGateway: RatingGateway,
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

  async getRatings(bookId: string) {
    return this.ratingModel
      .find({ book: new Types.ObjectId(bookId) })
      .populate('user', 'fullname');
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
