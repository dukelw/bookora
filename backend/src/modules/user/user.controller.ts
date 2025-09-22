import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('User') // gom nhóm các API user trong Swagger
@ApiBearerAuth() // để Swagger hiển thị ô nhập JWT token
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ user (yêu cầu JWT)' })
  @ApiResponse({ status: 200, description: 'Thông tin hồ sơ user trả về thành công' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async getProfile(@Req() req: any) {
    return this.userService.findById(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  @ApiOperation({ summary: 'Cập nhật hồ sơ user (yêu cầu JWT)' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công, trả về user mới' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user._id; // lấy từ JWT payload
    const user = await this.userService.updateUser(userId, updateUserDto);
    if (!user) return { message: 'User not found' };
    return { message: 'Profile updated successfully', user };
  }
}
