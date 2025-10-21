import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RealtimeGateway } from 'src/gateway/realtime.gateway';
import { Comment, CommentDocument } from 'src/schemas/comment.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async create(data: {
    user?: string;
    bookId: string;
    content: string;
    parentComment?: string | null;
  }) {
    const comment = await this.commentModel.create({
      user: data.user ? new Types.ObjectId(data.user) : null,
      bookId: new Types.ObjectId(data.bookId),
      content: data.content,
      parentComment: data.parentComment
        ? new Types.ObjectId(data.parentComment)
        : null,
    });

    const populated = await comment.populate('user', 'name avatar');

    this.realtimeGateway.server
      .to(data.bookId)
      .emit('commentCreated', populated);
    return populated;
  }

  async findByBook(bookId: string) {
    return this.commentModel
      .find({ bookId })
      .populate('user', 'name avatar email')
      .populate({
        path: 'parentComment',
        select: 'user content createdAt updatedAt',
        populate: {
          path: 'user',
          select: 'name avatar email',
        },
      })
      .sort({ createdAt: -1 });
  }

  async update(commentId: string, content: string) {
    const comment = await this.commentModel
      .findByIdAndUpdate(commentId, { content }, { new: true })
      .populate('user', 'name avatar');

    if (!comment) throw new NotFoundException('Comment not found');
    this.realtimeGateway.server
      .to(comment.bookId.toString())
      .emit('commentUpdated', comment);
    return comment;
  }

  async remove(commentId: string) {
    const comment = await this.commentModel.findByIdAndDelete(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    this.realtimeGateway.server
      .to(comment.bookId.toString())
      .emit('commentDeleted', { _id: commentId });
    return { message: 'Deleted successfully' };
  }

  async toggleLike(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const index = comment.likes.indexOf(userId);
    if (index === -1) comment.likes.push(userId);
    else comment.likes.splice(index, 1);

    await comment.save();
    return comment;
  }
}
