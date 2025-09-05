/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/JwtPayload';
import { randomBytes } from 'crypto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async create(email: string, password: string, address: string) {
    const hash = await bcrypt.hash(password, 10);
    const user = new this.userModel({ email, password: hash, address });
    return user.save();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async validateAuth(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch ? user : null;
  }

  async signInOauth(email: string, name: string, image: string = '') {
    let user = await this.findByEmail(email);

    if (!user) {
      const randomPassword = randomBytes(16).toString('hex');
      const hashed = await bcrypt.hash(randomPassword, 10);
      user = await this.userService.create({
        email,
        name,
        password: hashed,
        avatar: image,
      });
    }

    if (!user) {
      throw new InternalServerErrorException(
        'Failed to create user during OAuth sign-in',
      );
    }

    const tokens = this.generateTokens(user);

    return {
      user,
      tokens,
    };
  }

  generateTokens(user: UserDocument) {
    const payload = { sub: user._id.toString(), email: user.email };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Không lưu refresh token hiện tại, chỉ gửi cho client
    return { accessToken, refreshToken };
  }

  async refreshAccessToken(token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const user = await this.userModel.findById(payload.sub);
      if (!user) return null;

      // Kiểm tra token đã bị dùng chưa
      if (user.usedRefreshTokens.includes(token)) {
        // Token đã bị xài lại → reject
        return null;
      }

      // Tạo token mới
      const newAccessToken = this.jwtService.sign(
        { sub: user._id.toString(), email: user.email },
        { expiresIn: '15m' },
      );
      const newRefreshToken = this.jwtService.sign(
        { sub: user._id.toString(), email: user.email },
        { expiresIn: '7d' },
      );

      // Lưu token cũ vào usedRefreshTokens
      user.usedRefreshTokens.push(token);

      // Optionally: clean up các token đã expired trong usedRefreshTokens (nếu muốn)
      // Chú ý: JWT không lưu thông tin expire timestamp trực tiếp, cần decode nếu muốn cleanup

      await user.save();

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      return null;
    }
  }

  async logout(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId);
    if (!user) return false;

    // Nếu client gửi refreshToken, đánh dấu token này đã dùng
    if (refreshToken && !user.usedRefreshTokens.includes(refreshToken)) {
      user.usedRefreshTokens.push(refreshToken);
    }

    await user.save();
    return true;
  }
}
