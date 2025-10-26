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

  async findAll(searchKey?: string, page = 1, limit = 10) {
    const filter: any = {};

    if (searchKey) {
      filter.$or = [
        { name: { $regex: searchKey, $options: 'i' } }, // tìm theo tên collection
        { description: { $regex: searchKey, $options: 'i' } }, // nếu có mô tả
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.collectionModel
        .find(filter)
        .populate('sliders')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.collectionModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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

    // Nếu bật active = true → tắt active của tất cả collection khác
    if (active) {
      await this.collectionModel.updateMany(
        { _id: { $ne: id } }, // khác id hiện tại
        { $set: { isActive: false } },
      );
    }

    // Cập nhật trạng thái collection hiện tại
    collection.isActive = active;
    await collection.save();

    // Cập nhật tất cả slider trong collection này
    await this.sliderModel.updateMany(
      { _id: { $in: collection.sliders } },
      { isActive: active },
    );

    return collection;
  }
}
