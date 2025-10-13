import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from 'src/schemas/user.schema';
import { UpdateUserDto } from '../auth/dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: Partial<User>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const createdUser = new this.userModel(data);
    await createdUser.save();
    return this.userModel
      .findById(createdUser._id)
      .select('-usedRefreshTokens -otp -otpExpiresAt -otpAttempts')
      .exec();
  }

  async findAll(
    keySearch?: string,
    page = 1,
    limit = 10,
    status: 'active' | 'disable' | '' = '',
    role: 'admin' | 'customer' | '' = '',
  ): Promise<{ users: User[]; total: number }> {
    const query: any = {};

    if (keySearch) {
      query.$or = [
        { name: { $regex: keySearch, $options: 'i' } },
        { email: { $regex: keySearch, $options: 'i' } },
      ];
    }

    if (status !== '') {
      query.status = status;
    }

    if (role !== '') {
      query.role = role;
    }

    const total = await this.userModel.countDocuments(query);
    const users = await this.userModel
      .find(query)
      .select(' -usedRefreshTokens -otp -otpExpiresAt -otpAttempts')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return { users, total };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .select('-usedRefreshTokens -otp -otpExpiresAt -otpAttempts')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    const { password, ...rest } = updateUserDto;
    if (password && password.trim()) {
      const hashed = await bcrypt.hash(password, 10);
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          userId,
          { $set: { ...rest, password: hashed } },
          { new: true },
        )
        .select('-usedRefreshTokens -otp -otpExpiresAt -otpAttempts');
      if (!updatedUser) throw new NotFoundException('User not found');
      return updatedUser;
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { $set: rest }, { new: true })
      .select('-usedRefreshTokens -otp -otpExpiresAt -otpAttempts');

    if (!updatedUser) throw new NotFoundException('User not found');
    return updatedUser;
  }

  async updateStatus(userId: string, status: 'active' | 'disable') {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
