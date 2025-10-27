import { Transform } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { Granularity } from 'src/enums';

export class TimeRangeDto {
  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2025-01-01T00:00:00.000Z',
    description:
      'Start of time range (inclusive). Defaults to (to - 365 days).',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsDate()
  from?: Date;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2025-12-31T23:59:59.000Z',
    description: 'End of time range (inclusive). Defaults to now.',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsDate()
  to?: Date;

  @ApiPropertyOptional({
    enum: ['year', 'quarter', 'month', 'week'],
    example: 'month',
    description: 'Grouping level for time-series endpoints. Defaults to year.',
  })
  @IsOptional()
  @IsIn(['year', 'quarter', 'month', 'week'])
  granularity?: Granularity = 'year';

  @ApiPropertyOptional({
    type: String,
    example: 'UTC',
    description:
      'IANA timezone for date grouping (e.g., UTC, Asia/Ho_Chi_Minh).',
  })
  @IsOptional()
  @IsString()
  tz?: string = 'UTC';

  @ApiPropertyOptional({
    type: Number,
    example: 10,
    minimum: 1,
    description: 'Limit for lists (e.g., top products). Defaults to 10.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: ['none', 'variant', 'book'],
    example: 'none',
    description:
      'Profit calculation mode: none (default), variant (uses book.variants.cost), or book (uses book.cost).',
  })
  @IsOptional()
  @IsIn(['none', 'variant', 'book'])
  profitMode?: 'none' | 'variant' | 'book' = 'none';
}
