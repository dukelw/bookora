import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSliderCollectionDto } from './dto/create-slider-collection.dto';
import {
  SliderCollection,
  SliderCollectionDocument,
} from 'src/schemas/slider-collection.schema';
import { Slider, SliderDocument } from 'src/schemas/slider.schema';

@Injectable()
export class SliderCollectionService {
  constructor(
    @InjectModel(SliderCollection.name)
    private collectionModel: Model<SliderCollectionDocument>,
    @InjectModel(Slider.name)
    private sliderModel: Model<SliderDocument>,
  ) {}

  async create(dto: CreateSliderCollectionDto) {
    const collection = new this.collectionModel(dto);
    return collection.save();
  }

  async findAll() {
    return this.collectionModel.find().populate('sliders').exec();
  }

  async findOne(id: string) {
    const collection = await this.collectionModel
      .findById(id)
      .populate('sliders')
      .exec();
    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  async findActiveWithActiveSliders() {
    const collections = await this.collectionModel
      .findOne({ isActive: true })
      .populate({
        path: 'sliders',
        match: { isActive: true },
      })
      .exec();

    return collections;
  }

  async remove(id: string) {
    const res = await this.collectionModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Collection not found');
    return { deleted: true };
  }

  async setActive(id: string, active: boolean) {
    const collection = await this.collectionModel.findById(id);
    if (!collection) throw new NotFoundException('Collection not found');

    collection.isActive = active;
    await collection.save();

    await this.sliderModel.updateMany(
      { _id: { $in: collection.sliders } },
      { isActive: active },
    );

    return collection;
  }
}
