import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateDiscountDto } from './create-discount.dto';

export class UpdateDiscountDto extends PartialType(CreateDiscountDto) {
  @ApiPropertyOptional({ example: 60000, description: 'New discount value in VND' })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  value?: number;

  @ApiPropertyOptional({ example: 7, description: 'New usage limit (max 10)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  usageLimit?: number;
}
