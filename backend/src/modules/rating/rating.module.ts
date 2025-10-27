import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rating, RatingSchema } from 'src/schemas/rating.schema';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { RealtimeGateway } from 'src/gateway/realtime.gateway';
import { Book, BookSchema } from 'src/schemas/book.schema';
import {
  ReviewRequest,
  ReviewRequestSchema,
} from 'src/schemas/request-review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Rating.name, schema: RatingSchema },
      { name: Book.name, schema: BookSchema },
      { name: ReviewRequest.name, schema: ReviewRequestSchema },
    ]),
  ],
  controllers: [RatingController],
  providers: [RatingService, RealtimeGateway],
  exports: [RatingService],
})
export class RatingModule {}
