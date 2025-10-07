import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Discount } from 'src/schemas/discount.schema';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Injectable()
export class DiscountService {
  constructor(
    @InjectModel(Discount.name) private discountModel: Model<Discount>,
  ) {}

  async create(dto: CreateDiscountDto) {
    return this.discountModel.create(dto);
  }

  async update(id: string, dto: UpdateDiscountDto) {
    const discount = await this.discountModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!discount) throw new NotFoundException('Discount not found');
    return discount;
  }

  async findAll() {
    return this.discountModel
      .find()
      .populate('orders', 'totalAmount createdAt');
  }

  async validateAndApply(code: string, orderTotal: number) {
    const discount = await this.discountModel.findOne({ code });

    if (!discount) throw new NotFoundException('Discount code not found');
    if (discount.usedCount >= discount.usageLimit) {
      throw new BadRequestException('Discount code usage limit reached');
    }

    const discountedTotal = Math.max(orderTotal - discount.value, 0);
    return { discount, discountedTotal };
  }

  async markAsUsed(code: string, orderId: string) {
    const discount = await this.discountModel.findOne({ code });
    if (!discount) throw new NotFoundException('Discount not found');

    discount.usedCount += 1;
    discount.orders.push(new Types.ObjectId(orderId));
    await discount.save();

    return discount;
  }

  async toggleActive(id: string) {
    const discount = await this.discountModel.findById(id);
    if (!discount) throw new NotFoundException('Discount not found');

    discount.active = !discount.active;
    await discount.save();
    return discount;
  }
}
