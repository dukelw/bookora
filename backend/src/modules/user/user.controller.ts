import {
  Controller,
  Get,
  Put,
  Param,
  Patch,
  Body,
  UseGuards,
  Req,
  Query,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { AdminGuard } from 'src/guards/admin.guard';
import { UpdateStatusDto } from './dto/update-status.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('User') // gom nhóm các API user trong Swagger
@ApiBearerAuth() // để Swagger hiển thị ô nhập JWT token
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ user (yêu cầu JWT)' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin hồ sơ user trả về thành công',
  })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async getProfile(@Req() req: any) {
    return this.userService.findById(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  @ApiOperation({ summary: 'Cập nhật hồ sơ user (yêu cầu JWT)' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công, trả về user mới',
  })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user._id; // lấy từ JWT payload
    const user = await this.userService.updateUser(userId, updateUserDto);
    if (!user) return { message: 'User not found' };
    return { message: 'Profile updated successfully', user };
  }

  // ========== ADMIN ==========
  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng (Admin)' })
  @ApiQuery({ name: 'keySearch', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'role', required: false })
  getUsers(
    @Query('keySearch') keySearch?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status: 'active' | 'disable' | '' = '',
    @Query('role') role: 'admin' | 'customer' | '' = '',
  ) {
    return this.userService.findAll(
      keySearch,
      Number(page),
      Number(limit),
      status,
      role,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Cập nhật người dùng theo ID (Admin)' })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Cập nhật trạng thái ngưới dùng theo ID (Admin)' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.userService.updateStatus(id, dto.status);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-shipping-address')
  @ApiOperation({ summary: 'Đổi địa chỉ giao hàng' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { address: { type: 'string' } },
      required: ['address'],
    },
  })
  async changeShippingAddress(
    @Req() req: any,
    @Body() body: { address: string },
  ) {
    const ok = await this.userService.changeShippingAddress(
      req.user._id,
      body.address,
    );
    if (!ok) return { error: 'Không thể đổi địa chỉ giao hàng' };
    return { message: 'Cập nhật địa chỉ giao hàng thành công' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('remove-address')
  @ApiOperation({ summary: 'Xóa một địa chỉ khỏi danh sách địa chỉ' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { address: { type: 'string' } },
      required: ['address'],
    },
  })
  async removeAddress(@Req() req: any, @Body() body: { address: string }) {
    const ok = await this.userService.removeAddress(req.user._id, body.address);
    if (!ok) return { error: 'Không thể xóa địa chỉ' };
    return { message: 'Xóa địa chỉ thành công' };
  }
}
