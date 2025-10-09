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
    const existing = await this.discountModel
      .findOne({ code: dto.code })
      .exec();
    if (existing) {
      throw new BadRequestException('Discount code already exists');
    }
    return this.discountModel.create(dto);
  }

  async update(id: string, dto: UpdateDiscountDto) {
    const discount = await this.discountModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!discount) throw new NotFoundException('Discount not found');
    return discount;
  }

  async remove(id: string): Promise<any> {
    const discount = await this.discountModel.findById(id).exec();
    if (!discount) throw new NotFoundException('Discount not found');
    if ((discount.usedCount || 0) > 0) {
      throw new BadRequestException('Discount already used, cannot be deleted');
    }
    await this.discountModel.findByIdAndDelete(id).exec();
    return {
      message: 'Delete successfully',
      statusCode: 200,
    };
  }

  async findAll(
    keySearch?: string,
    page = 1,
    limit = 10,
    active: true | false | null = null,
    type: 'percentage' | 'amount' | '' = '',
  ): Promise<{ discounts: Discount[]; total: number }> {
    const query: any = {};

    if (keySearch) {
      query.$or = [{ code: { $regex: keySearch, $options: 'i' } }];
    }

    if (active !== null) {
      query.active = active;
    }

    if (type !== '') {
      query.type = type;
    }

    const total = await this.discountModel.countDocuments(query);
    const discounts = await this.discountModel
      .find(query)
      .populate('orders', 'totalAmount createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return { discounts, total };
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
