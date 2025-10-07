import {
  Body,
  Controller,
  Get,
  Put,
  Patch,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Discounts')
@Controller('discounts')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  //   @ApiBearerAuth('access-token')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async create(@Body() dto: CreateDiscountDto) {
    return this.discountService.create(dto);
  }

  //   @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDiscountDto) {
    return this.discountService.update(id, dto);
  }

  //   @ApiBearerAuth('access-token')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async findAll() {
    return this.discountService.findAll();
  }

  //   @ApiBearerAuth('access-token')
  // @UseGuards(JwtAuthGuard)
  @Post('apply/:code')
  async applyDiscount(
    @Param('code') code: string,
    @Body('orderTotal') orderTotal: number,
  ) {
    return this.discountService.validateAndApply(code, orderTotal);
  }

  //   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/status')
  toggle(@Param('id') id: string) {
    return this.discountService.toggleActive(id);
  }
}
