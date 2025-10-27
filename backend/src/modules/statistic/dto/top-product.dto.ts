import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { TimeRangeDto } from './time-range.dto';

export class TopProductsDto extends TimeRangeDto {
  @ApiPropertyOptional({
    type: Number,
    example: 5,
    minimum: 1,
    description: 'Number of top products to return. Defaults to 10.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
