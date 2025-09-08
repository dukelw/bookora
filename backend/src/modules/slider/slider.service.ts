import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateSliderDto } from './dto/create-slider.dto';
import { Slider, SliderDocument } from 'src/schemas/slider.schema';
import {
  SliderCollection,
  SliderCollectionDocument,
} from 'src/schemas/slider-collection.schema';

@Injectable()
export class SliderService {
  constructor(
    @InjectModel(Slider.name) private sliderModel: Model<SliderDocument>,
    @InjectModel(SliderCollection.name)
    private collectionModel: Model<SliderCollectionDocument>,
  ) {}

  async create(dto: CreateSliderDto) {
    const collection = await this.collectionModel.findById(dto.collection);
    if (!collection) throw new NotFoundException('Collection not found');

    const slider = new this.sliderModel({
      ...dto,
      collection: new Types.ObjectId(dto.collection),
    });

    const saved = await slider.save();

    collection.sliders.push(saved._id as Types.ObjectId);
    await collection.save();

    return saved;
  }

  async findAll() {
    return this.sliderModel.find().populate('collection').exec();
  }

  async findOne(id: string) {
    const slider = await this.sliderModel
      .findById(id)
      .populate('collection')
      .exec();
    if (!slider) throw new NotFoundException('Slider not found');
    return slider;
  }

  async remove(id: string) {
    const slider = await this.sliderModel.findById(id);
    if (!slider) throw new NotFoundException('Slider not found');

    await this.collectionModel.findByIdAndUpdate(slider.collection, {
      $pull: { sliders: slider._id },
    });

    await slider.deleteOne();
    return { deleted: true };
  }

  async setActive(id: string, active: boolean) {
    const slider = await this.sliderModel.findById(id);
    if (!slider) throw new NotFoundException('Slider not found');

    slider.isActive = active;
    await slider.save();

    return slider;
  }
}
