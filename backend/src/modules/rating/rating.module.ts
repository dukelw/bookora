import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rating, RatingSchema } from 'src/schemas/rating.schema';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { RealtimeGateway } from 'src/gateway/realtime.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rating.name, schema: RatingSchema }]),
  ],
  controllers: [RatingController],
  providers: [RatingService, RealtimeGateway],
  exports: [RatingService],
})
export class RatingModule {}
