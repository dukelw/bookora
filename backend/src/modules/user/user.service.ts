import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';

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

  async updateProfile(id: string, data: Partial<User>): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .select('-password')
      .exec();
  }
}
