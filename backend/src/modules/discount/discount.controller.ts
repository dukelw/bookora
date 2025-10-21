import {
  Body,
  Controller,
  Get,
  Put,
  Patch,
  Param,
  Post,
  UseGuards,
  Query,
  Delete,
} from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

// @ApiBearerAuth()
@ApiTags('Discounts')
@Controller('discounts')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async create(@Body() dto: CreateDiscountDto) {
    return this.discountService.create(dto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDiscountDto) {
    return this.discountService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discountService.remove(id);
  }

  // @ApiBearerAuth('access-token')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  @ApiQuery({ name: 'keySearch', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  async findAll(
    @Query('keySearch') keySearch?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') active: true | false | null = null,
    @Query('type') type: 'percentage' | 'amount' | '' = '',
  ) {
    return this.discountService.findAll(
      keySearch,
      Number(page),
      Number(limit),
      active,
      type,
    );
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('apply/:code')
  async applyDiscount(
    @Param('code') code: string,
    @Body('orderTotal') orderTotal: number,
  ) {
    return this.discountService.validateAndApply(code, orderTotal);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/status')
  toggle(@Param('id') id: string) {
    return this.discountService.toggleActive(id);
  }
}
