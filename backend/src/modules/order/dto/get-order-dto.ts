// ADD: ép kiểu số từ query
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from 'src/schemas/order.schema';
import { Type } from 'class-transformer'; // <-- ADD
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetAllOrdersDto {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ example: 1, description: 'Trang hiện tại' })
  @Type(() => Number) // <-- ADD
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ example: 10, description: 'Số lượng mỗi trang' })
  @Type(() => Number) // <-- ADD
  limit?: number = 10;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    enum: OrderStatus,
    description: 'Lọc theo trạng thái đơn hàng',
  })
  status?: OrderStatus;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: '671a1b2f03b4c1...',
    description: 'Lọc theo user (tùy chọn)',
  })
  userId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'today',
    description:
      'Filter theo thời gian: today | yesterday | this_week | this_month | custom',
  })
  timePreset?: 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: '2025-11-01,2025-11-25',
    description:
      'Dùng khi timePreset = custom. Format: startDate,endDate (YYYY-MM-DD)',
  })
  dateRange?: string;
}
