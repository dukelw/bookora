import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ReviewRequest,
  ReviewRequestStatus,
} from 'src/schemas/request-review.schema';

@Injectable()
export class ReviewRequestService {
  constructor(
    @InjectModel(ReviewRequest.name)
    private reviewRequestModel: Model<ReviewRequest>,
  ) {}

  async create(orderId: string, userId: string, bookId: string) {
    const request = new this.reviewRequestModel({
      order: orderId,
      user: userId,
      book: bookId,
    });
    return request.save();
  }

  async findAllByUser(userId: string) {
    return this.reviewRequestModel
      .find({ user: userId })
      .populate('book')
      .populate('order');
  }

  async markAsComplete(id: string) {
    const request = await this.reviewRequestModel.findById(id);
    if (!request) throw new NotFoundException('Review request not found');

    request.status = ReviewRequestStatus.COMPLETED;
    await request.save();
    return request;
  }
}
