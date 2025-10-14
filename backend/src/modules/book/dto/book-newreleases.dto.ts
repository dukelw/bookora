import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsMongoId, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class NewReleasesQueryDto {
  @ApiPropertyOptional({ description: 'Giới hạn số lượng trả về', default: 12, maximum: 50 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
  limit?: number = 12;

  // NEW: filter by createdAt >= from (ISO date) e.g. 2025-10-01T00:00:00.000Z
  @ApiPropertyOptional({ description: 'Từ ngày (ISO). VD: 2025-01-01' })
  @IsOptional() @IsDateString()
  from?: string;

  // NEW: alternatively, last N days up to now (if `from` not provided)
  @ApiPropertyOptional({ description: 'Lấy danh sách theo số ngày gần nhất', default: 30 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(3650)
  days?: number = 30;

  // (Optional filters)
  @ApiPropertyOptional({ description: 'Lọc theo categoryId' })
  @IsOptional() @IsMongoId()
  category?: string;

  @ApiPropertyOptional({ description: 'Lọc theo author (exact match)' })
  @IsOptional() @IsString()
  author?: string;

  @ApiPropertyOptional({ description: 'Lọc theo publisher (exact match)' })
  @IsOptional() @IsString()
  publisher?: string;
}
