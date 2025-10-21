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
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
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

    if (user.status === 'disable') {
      throw new UnauthorizedException('Account disabled, contact admin');
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

  // Token cho reset password
  generateResetToken(email: string): string {
    return this.jwtService.sign(
      { email, purpose: 'reset-password' },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '15m', // 15 phút là hợp lý
      },
    );
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

  private generateOtp(): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
  }

  private getTransporter() {
    const host = this.configService.get('SMTP_HOST');
    const port = parseInt(this.configService.get('SMTP_PORT') || '587', 10);
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASS');

    return nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
    });
  }

  async sendResetOtp(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return true;
    }

    const otp = this.generateOtp();
    const expires = new Date(Date.now() + 1000 * 60 * 10); // 10 phút

    user.otp = otp;
    user.otpExpiresAt = expires;
    user.otpAttempts = 0;

    await user.save();

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: this.configService.get('SMTP_FROM') || 'no-reply@example.com',
        to: email,
        subject: 'OTP khôi phục mật khẩu',
        text: `Mã OTP của bạn là ${otp}. Mã sẽ hết hạn sau 10 phút.`,
        html: `<p>Mã OTP của bạn là <b>${otp}</b>. Mã sẽ hết hạn sau 10 phút.</p>`,
      });
      console.log('>>> Sending mail to', email);
    } catch (err) {
      console.error('Mail send error', err);
    }
    return true;
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email });
    if (!user) return false;

    if (!user.otp || !user.otpExpiresAt) return false;
    if (user.otpExpiresAt.getTime() < Date.now()) {
      // expired: clear otp
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      await user.save();
      return false;
    }
    user.otpAttempts = (user.otpAttempts || 0) + 1;
    if (user.otpAttempts > 5) {
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      user.otpAttempts = 0;
      await user.save();
      return false;
    }

    const match = user.otp === otp;
    if (match) {
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      user.otpAttempts = 0;
      await user.save();
      return true;
    } else {
      await user.save();
      return false;
    }
  }

  async resetPasswordWithToken(
    resetPasswordToken: string,
    newPassword: string,
  ): Promise<boolean> {
    try {
      const payload = this.jwtService.verify(resetPasswordToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (payload.purpose !== 'reset-password') return false;

      const user = await this.userModel.findOne({ email: payload.email });
      if (!user) return false;

      const hash = await bcrypt.hash(newPassword, 10);
      user.password = hash;
      user.usedRefreshTokens = []; // logout all sessions
      await user.save();

      return true;
    } catch (err) {
      return false;
    }
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user) return false;
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return false;

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;

    user.usedRefreshTokens = [];
    await user.save();
    return true;
  }

  async registerFromCheckout(payload: {
    email: string;
    name?: string;
    phone?: string;
    address?: string;
  }) {
    const { email, name, phone, address } = payload;
    let user = await this.userModel.findOne({ email });
    let createdNew = false;
    let plainPassword = '';

    if (!user) {
      plainPassword = randomBytes(8).toString('hex');
      const hash = await bcrypt.hash(plainPassword, 10);
      user = new this.userModel({
        email,
        name,
        phone,
        address,
        password: hash,
        mustChangePassword: true,
      });
      await user.save();
      createdNew = true;
    }

    if (user.status === 'disable')
      throw new UnauthorizedException('Account disabled');

    const tokens = this.generateTokens(user);

    if (createdNew) {
      try {
        const frontendUrl =
          this.configService.get('FRONTEND_URL') ||
          this.configService.get('NEXT_PUBLIC_FRONTEND_URL') ||
          process.env.FRONTEND_URL ||
          'http://localhost:3000';

        const loginUrl = `${frontendUrl.replace(/\/$/, '')}/login`;

        const subject = 'Tài khoản Bookora của bạn đã được tạo';
        const htmlContent = `
        <p>Xin chào ${name || ''},</p>
        <p>Tài khoản của bạn đã được tạo tự động trên <b>Bookora</b> dựa theo thông tin đặt hàng.</p>
        <p>Thông tin đăng nhập của bạn:</p>
        <ul>
          <li><b>Email:</b> ${email}</li>
          <li><b>Mật khẩu tạm thời:</b> <code style="background:#f3f4f6;padding:4px 8px;border-radius:4px">${plainPassword}</code></li>
        </ul>
        <p>Vui lòng đăng nhập tại <a href="${loginUrl}">${loginUrl}</a> và đổi mật khẩu ngay sau khi đăng nhập để bảo mật tài khoản.</p>
        <p>Lưu ý: mật khẩu này chỉ nên được sử dụng một lần. Nếu bạn không yêu cầu tạo tài khoản này, vui lòng bỏ qua email này hoặc liên hệ bộ phận hỗ trợ.</p>
        <p>Trân trọng,<br/>Bookora Team</p>
      `;

        const mailDto: SendMailDto = {
          to: email,
          subject,
          content: htmlContent,
          name: name || undefined,
        };

        await this.mailService.sendMail(mailDto);
      } catch (err) {
        console.error(
          'Failed to send account email with plaintext password:',
          err,
        );
      }
    }

    return { user, tokens };
  }
}
