import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewRequestController } from './review-request.controller';
import { ReviewRequestService } from './review-request.service';
import {
  ReviewRequest,
  ReviewRequestSchema,
} from 'src/schemas/request-review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReviewRequest.name, schema: ReviewRequestSchema },
    ]),
  ],
  controllers: [ReviewRequestController],
  providers: [ReviewRequestService],
  exports: [ReviewRequestService, MongooseModule],
})
export class ReviewRequestModule {}
