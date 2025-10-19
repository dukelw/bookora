import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rating, RatingSchema } from 'src/schemas/rating.schema';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { RatingGateway } from './rating.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rating.name, schema: RatingSchema }]),
  ],
  controllers: [RatingController],
  providers: [RatingService, RatingGateway],
  exports: [RatingService],
})
export class RatingModule {}
