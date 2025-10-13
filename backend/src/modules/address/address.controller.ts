import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

class GuestCreateBody {
  // email tách riêng để auto-create user
  email!: string;
  address!: CreateAddressDto;
}

@ApiTags('Addresses')
@ApiBearerAuth()
@Controller()
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('addresses')
  @ApiOperation({ summary: 'List user addresses' })
  list(@Req() req: any) {
    return this.addressService.list(req.user._id);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Create an address' })
  create(@Req() req: any, @Body() dto: CreateAddressDto) {
    return this.addressService.create(req.user._id, dto);
  }

  @Patch('addresses/:id')
  @ApiOperation({ summary: 'Update an address' })
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.addressService.update(req.user._id, id, dto);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Soft delete an address' })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.addressService.remove(req.user._id, id);
  }

  @Patch('addresses/:id/default')
  @ApiOperation({ summary: 'Set as default address' })
  setDefault(@Req() req: any, @Param('id') id: string) {
    return this.addressService.setDefault(req.user._id, id);
  }

  // ----- Public for guest checkout -----
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
