import {
  BadRequestException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Address } from 'src/schemas/address.schema';
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
    const uid = new mongoose.Types.ObjectId(userId);
    return this.addressModel
      .find({ userId: uid, active: true })
      .sort({ isDefault: -1, updatedAt: -1 })
      .lean()
      .exec();
  }

  async create(userId: string, dto: CreateAddressDto) {
    const uid = new mongoose.Types.ObjectId(userId);
    const count = await this.addressModel.countDocuments({ userId: uid, active: true });
    if (count >= MAX_ADDRESSES_PER_USER) throw new BadRequestException('Address limit reached');

    const shouldBeDefault = dto.isDefault || count === 0;
    if (shouldBeDefault) {
      await this.addressModel.updateMany({ userId: uid, isDefault: true }, { $set: { isDefault: false } }).exec();
    }

    const doc = await this.addressModel.create({
      ...dto,
      userId: uid,
      isDefault: !!shouldBeDefault,
      active: true,
    });

    return doc.toObject();
  }

  private assertOwner(addr: Address, userId: string) {
    const ownerId = addr.userId instanceof mongoose.Types.ObjectId
      ? addr.userId
      : new mongoose.Types.ObjectId(addr.userId as any);
    const currentId = new mongoose.Types.ObjectId(userId);
    if (!ownerId.equals(currentId)) {
      throw new ForbiddenException('Address does not belong to current user');
    }
  }

  // chỉ lấy các key thực sự được truyền (không lấy undefined)
  private pickDefined<T extends object>(payload: T) {
    return Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined));
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {
    const addr = await this.addressModel.findById(id);
    if (!addr || !addr.active) throw new NotFoundException('Address not found');
    this.assertOwner(addr, userId);

    // Nếu yêu cầu đặt làm mặc định -> unset mặc định ở các địa chỉ khác trước
    if (dto.isDefault === true) {
      await this.addressModel.updateMany(
        { userId: addr.userId, isDefault: true },
        { $set: { isDefault: false } },
      ).exec();
    }

    // Chỉ cập nhật những trường có truyền trong body
    const patch = this.pickDefined(dto);
    if (Object.keys(patch).length === 0) {
      // Không có gì để cập nhật, trả về bản hiện tại
      return addr.toObject();
    }

    addr.set(patch);
    await addr.save({ validateModifiedOnly: true }); // chỉ validate các field đã thay đổi
    return addr.toObject();
  }

  async remove(userId: string, id: string) {
    const addr = await this.addressModel.findById(id);
    if (!addr || !addr.active) throw new NotFoundException('Address not found');
    this.assertOwner(addr, userId);

    const wasDefault = addr.isDefault;
    addr.active = false;
    addr.isDefault = false;
    await addr.save();

    if (wasDefault) {
      const latest = await this.addressModel.findOne({ userId: addr.userId, active: true })
        .sort({ updatedAt: -1 })
        .exec();
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
    this.assertOwner(addr, userId);

    await this.addressModel.updateMany(
      { userId: addr.userId, isDefault: true },
      { $set: { isDefault: false } },
    ).exec();

    addr.isDefault = true;
    await addr.save();
    return addr.toObject();
  }

  /**
   * Guest checkout: tạo (hoặc lấy) user theo email, rồi tạo address cho user đó.
   * Trả về snapshot để gắn vào Order.shippingAddress.
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

    const addr = await this.create(user._id.toString(), { ...dto, isDefault: true });

    const snapshot = {
      name: addr.fullName,
      phone: addr.phone,
      email,
      address: `${addr.addressLine1}, ${addr.ward}, ${addr.district}, ${addr.province}`,
      city: addr.province,
    };

    return {
      userId: user._id,
      addressId: addr._id,
      address: addr,
      shippingAddressSnapshot: snapshot,
    };
  }
}