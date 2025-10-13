import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Address, AddressType } from 'src/schemas/address.schema';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { User } from 'src/schemas/user.schema';

const MAX_ADDRESSES_PER_USER = 10;

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address.name) private readonly addressModel: Model<Address>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async list(userId: string) {
    return this.addressModel
      .find({ userId, active: true })
      .sort({ isDefault: -1, updatedAt: -1 })
      .lean()
      .exec();
  }

  async create(userId: string, dto: CreateAddressDto) {
    const count = await this.addressModel.countDocuments({ userId, active: true });
    if (count >= MAX_ADDRESSES_PER_USER) throw new BadRequestException('Address limit reached');

    const shouldBeDefault = dto.isDefault || count === 0;
    if (shouldBeDefault) {
      await this.addressModel.updateMany({ userId, isDefault: true }, { $set: { isDefault: false } }).exec();
    }

    const doc = await this.addressModel.create({
      ...dto,
      userId: new mongoose.Types.ObjectId(userId),
      isDefault: !!shouldBeDefault,
      active: true,
    });

    return doc.toObject();
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {
    const addr = await this.addressModel.findById(id);
    if (!addr || !addr.active) throw new NotFoundException('Address not found');
    if (addr.userId.toString() !== userId) throw new ForbiddenException();

    if (dto.isDefault === true) {
      await this.addressModel.updateMany({ userId, isDefault: true }, { $set: { isDefault: false } }).exec();
    }

    Object.assign(addr, dto);
    await addr.save();
    return addr.toObject();
  }

  async remove(userId: string, id: string) {
    const addr = await this.addressModel.findById(id);
    if (!addr || !addr.active) throw new NotFoundException('Address not found');
    if (addr.userId.toString() !== userId) throw new ForbiddenException();

    const wasDefault = addr.isDefault;
    addr.active = false;
    addr.isDefault = false;
    await addr.save();

    if (wasDefault) {
      const latest = await this.addressModel.findOne({ userId, active: true }).sort({ updatedAt: -1 }).exec();
      if (latest) {
        latest.isDefault = true;
        await latest.save();
      }
    }

    return { success: true };
  }

  async setDefault(userId: string, id: string) {
    const addr = await this.addressModel.findById(id);
    if (!addr || !addr.active) throw new NotFoundException('Address not found');
    if (addr.userId.toString() !== userId) throw new ForbiddenException();

    await this.addressModel.updateMany({ userId, isDefault: true }, { $set: { isDefault: false } }).exec();
    addr.isDefault = true;
    await addr.save();
    return addr.toObject();
  }

  /**
   * Guest checkout flow vẫn dùng email để auto-create user,
   * NHƯNG Address entity không chứa email nữa.
   */
  async guestCreate(email: string, dto: CreateAddressDto) {
    if (!email) throw new BadRequestException('Email is required for guest checkout');

    let user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      user = await this.userModel.create({
        email,
        fullName: dto.fullName || '',
        phone: dto.phone || '',
        isAutoCreated: true,
        status: 'active',
      });
      // TODO: gửi email kích hoạt nếu muốn
    }

    const count = await this.addressModel.countDocuments({ userId: user._id, active: true });
    const addr = await this.create(user._id.toString(), { ...dto, isDefault: count === 0 || dto.isDefault });

    // snapshot để ghi vào Order.shippingAddress
    const snapshot = {
      name: addr.fullName,
      phone: addr.phone,
      email, // lấy từ tham số, không lưu trong Address
      address: `${addr.addressLine1}, ${addr.ward}, ${addr.district}, ${addr.province}`,
      city: addr.province,
      note: undefined,
    };

    return {
      userId: user._id,
      addressId: addr._id,
      address: addr,
      shippingAddressSnapshot: snapshot,
    };
  }
}