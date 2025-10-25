import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service';
import {
  CreateAddressDto,
  UpdateAddressDto,
  GuestCreateBody,
} from './dto/address.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Addresses')
@ApiBearerAuth()
// Bảo vệ toàn bộ nhóm /addresses bằng JWT
@UseGuards(AuthGuard('jwt'))
@Controller()
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  /** Lấy userId an toàn từ JWT; có fallback header x-user-id cho DEV */
  private userIdFromReq(req: any): string {
    const u = req?.user ?? {};
    const uid =
      u._id || u.id || u.userId || u.sub || u.uid || req.headers['x-user-id'];
    if (!uid) {
      throw new UnauthorizedException(
        'Unauthenticated. Click "Authorize" and provide a valid Bearer token (or set x-user-id header for DEV).',
      );
    }
    return String(uid);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'List user addresses' })
  list(@Req() req: any) {
    return this.addressService.list(this.userIdFromReq(req));
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Create an address' })
  create(@Req() req: any, @Body() dto: CreateAddressDto) {
    return this.addressService.create(this.userIdFromReq(req), dto);
  }

  @Patch('addresses/:id')
  @ApiOperation({ summary: 'Update an address' })
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.update(this.userIdFromReq(req), id, dto);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Soft delete an address' })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.addressService.remove(this.userIdFromReq(req), id);
  }

  @Patch('addresses/:id/default')
  @ApiOperation({ summary: 'Set as default address' })
  setDefault(@Req() req: any, @Param('id') id: string) {
    return this.addressService.setDefault(this.userIdFromReq(req), id);
  }

  // ===== Public endpoint cho guest checkout (không cần JWT) =====
  @UseGuards() // clear guard
  @Post('checkout/guest-address')
  @ApiOperation({
    summary: 'Guest checkout: create address (auto-create user by email)',
    description: 'Body: { email: string, address: CreateAddressDto }',
  })
  guestCreate(@Body() body: GuestCreateBody) {
    const { email, address } = body;
    return this.addressService.guestCreate(email, address);
  }
}
