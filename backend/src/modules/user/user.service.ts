import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { UpdateUserDto } from '../auth/dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: Partial<User>) {
    const createdUser = new this.userModel(data);
    await createdUser.save();
    return this.userModel.findById(createdUser._id).select('-password').exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateUserDto },
      { new: true }, // trả về bản ghi sau khi update
    ).select('-password -usedRefreshTokens -otp -otpExpiresAt -otpAttempts'); // không trả về field nhạy cảm

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
