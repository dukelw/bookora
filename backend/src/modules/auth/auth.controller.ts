import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
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
    const auth = await this.authService.validateAuth(body.email, body.password);
    if (!auth) return { error: 'Invalid credentials' };

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
}
