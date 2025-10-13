import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsDateString, IsIn, IsInt, IsMongoId, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class BestSellersQueryDto {
  @ApiPropertyOptional({ description: 'Giới hạn số sách trả về', default: 12, maximum: 50 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
  limit?: number = 12;

  @ApiPropertyOptional({ description: 'Từ ngày (ISO). VD: 2025-01-01T00:00:00.000Z' })
  @IsOptional() @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'Đến ngày (ISO). VD: 2025-12-31T23:59:59.999Z' })
  @IsOptional() @IsDateString()
  to?: string;

  @ApiPropertyOptional({ description: 'Lọc theo categoryId' })
  @IsOptional() @IsMongoId()
  category?: string;

  @ApiPropertyOptional({ description: 'Lọc theo author (exact match)' })
  @IsOptional() @IsString()
  author?: string;

  @ApiPropertyOptional({ description: 'Lọc theo publisher (exact match)' })
  @IsOptional() @IsString()
  publisher?: string;

  @ApiPropertyOptional({ description: 'Bao gồm sách hết hàng', default: 'false', enum: ['true','false'] })
  @IsOptional() @IsBooleanString()
  includeOutOfStock?: string = 'false';
}
