import {
  Controller,
  Post,
  Body,
  // UseGuards,
  Request,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import {
  RegisterAuthDto,
  LoginAuthDto,
  RefreshTokenDto,
  LogoutDto,
  OAuthDto,
} from './dto/auth.dto';

import {
  ForgotPasswordDto,
  VerifyOtpDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/forgot-reset.dto';
import { UseGuards, Req } from '@nestjs/common';

import { JwtAuthGuard } from 'src/guards/jwt.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Đăng ký auth mới' })
  @ApiBody({ type: RegisterAuthDto })
  async register(@Body() body: RegisterAuthDto) {
    const auth = await this.authService.create(
      body.fullname,
      body.email,
      body.password,
      body.address,
    );
    const tokens = this.authService.generateTokens(auth);
    return {
      id: auth._id,
      email: auth.email,
      shippingAddress: auth.shippingAddress,
      ...tokens,
    };
  }

  @Post('signin')
  @ApiOperation({ summary: 'Đăng nhập auth' })
  @ApiBody({ type: LoginAuthDto })
  async login(@Body() body: LoginAuthDto) {
    console.log('JWT SECRET', process.env.JWT_SECRET);
    const auth = await this.authService.validateAuth(body.email, body.password);
    if (!auth) throw new BadRequestException('Invalid credentials');
    if (auth.status === 'disable')
      throw new BadRequestException('Account has been disabled.');

    const tokens = this.authService.generateTokens(auth);
    const user = await this.authService.findByEmail(body.email);
    return {
      status: 200,
      tokens,
      user,
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  async refresh(@Body() body: RefreshTokenDto) {
    const tokens = await this.authService.refreshAccessToken(body.token);
    if (!tokens) return { error: 'Invalid or expired refresh token' };
    return tokens;
  }

  @Post('oauth')
  @ApiOperation({ summary: 'Đăng nhập bằng OAuth (Google, GitHub, ...)' })
  @ApiBody({
    type: OAuthDto,
    description: 'Thông tin user lấy từ provider OAuth (Google, GitHub, ...)',
  })
  async signInOAuth(
    @Body() dto: OAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.authService.signInOauth(
      dto.email,
      dto.name,
      dto.image ?? '',
    );

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout auth' })
  @ApiBody({ type: LogoutDto })
  async logout(@Request() req, @Body() body: LogoutDto) {
    const authId = req.user._id;
    const result = await this.authService.logout(authId, body.refreshToken);
    if (!result) return { error: 'Logout failed' };
    return { message: 'Logged out successfully' };
  }

  @Post('forgot')
  @ApiOperation({ summary: 'Yêu cầu OTP khôi phục mật khẩu' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    console.log('Swagger Body:', body);
    const result = await this.authService.sendResetOtp(body.email);
    if (!result)
      return { message: 'If the email exists, an OTP has been sent' };
    return { message: 'OTP sent' };
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Xác nhận OTP và nhận token tạm để đổi mật khẩu' })
  @ApiBody({ type: VerifyOtpDto })
  async verifyOtp(@Body() body: VerifyOtpDto) {
    const ok = await this.authService.verifyOtp(body.email, body.otp);
    if (!ok) return { valid: false };

    const resetPasswordToken = this.authService.generateResetToken(body.email);
    return { valid: true, resetPasswordToken };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset mật khẩu bằng token tạm' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() body: ResetPasswordDto) {
    const ok = await this.authService.resetPasswordWithToken(
      body.resetPasswordToken,
      body.newPassword,
    );
    if (!ok) return { error: 'Token không hợp lệ hoặc đã hết hạn' };
    return { message: 'Password reset successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiOperation({ summary: 'Đổi mật khẩu (user đang đăng nhập)' })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(@Req() req: any, @Body() body: ChangePasswordDto) {
    const userId = req.user._id;
    const ok = await this.authService.changePassword(
      userId,
      body.oldPassword,
      body.newPassword,
    );
    if (!ok) return { error: 'Old password incorrect' };
    return { message: 'Password changed successfully' };
  }

  @Post('register-from-checkout')
  @ApiOperation({
    summary: 'Tạo tài khoản từ thông tin checkout (guest -> user)',
  })
  async registerFromCheckout(
    @Body()
    body: {
      email: string;
      name?: string;
      phone?: string;
      address?: string;
    },
  ) {
    if (!body?.email) throw new BadRequestException('Email is required');
    const result = await this.authService.registerFromCheckout({
      email: body.email,
      name: body.name,
      phone: body.phone,
      address: body.address,
    });
    return result;
  }
}
