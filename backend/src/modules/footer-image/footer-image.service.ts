import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  FooterImage,
  FooterImageDocument,
} from 'src/schemas/footer-image.schema';
import { CreateFooterImageDto } from './dto/create-footer-image.dto';
import { UpdateFooterImageDto } from './dto/update-footer-image.dto';

@Injectable()
export class FooterImageService {
  constructor(
    @InjectModel(FooterImage.name)
    private footerImageModel: Model<FooterImageDocument>,
  ) {}

  async create(dto: CreateFooterImageDto) {
    const footerImage = new this.footerImageModel(dto);
    return footerImage.save();
  }

  async findAll() {
    return this.footerImageModel
      .find()
      .sort({ order: 1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const image = await this.footerImageModel.findById(id).exec();
    if (!image) throw new NotFoundException('Footer image not found');
    return image;
  }

  async update(id: string, dto: UpdateFooterImageDto) {
    const image = await this.footerImageModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!image) throw new NotFoundException('Footer image not found');
    return image;
  }

  async remove(id: string) {
    const image = await this.footerImageModel.findByIdAndDelete(id);
    if (!image) throw new NotFoundException('Footer image not found');
    return { message: 'Footer image deleted successfully' };
  }

  async getActiveImages() {
    return this.footerImageModel
      .find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .exec();
  }
}
