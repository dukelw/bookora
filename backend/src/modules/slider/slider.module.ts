import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SliderService } from './slider.service';
import { SliderController } from './slider.controller';
import { SliderCollectionService } from './slider-collection.service';
import { SliderCollectionController } from './slider-collection.controller';
import { Slider, SliderSchema } from 'src/schemas/slider.schema';
import {
  SliderCollection,
  SliderCollectionSchema,
} from 'src/schemas/slider-collection.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Slider.name, schema: SliderSchema },
      { name: SliderCollection.name, schema: SliderCollectionSchema },
    ]),
  ],
  controllers: [SliderController, SliderCollectionController],
  providers: [SliderService, SliderCollectionService],
})
export class SliderModule {}
