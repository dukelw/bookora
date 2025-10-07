import { IsNumber, IsString, IsBoolean, IsOptional, IsEnum, Length, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from 'src/schemas/discount.schema';

export class CreateDiscountDto {
  @ApiProperty({ example: 'AB12C', description: '5 ký tự' })
  @IsString()
  @Length(5, 5)
  code: string;

  @ApiProperty({ example: 50, description: 'Số tiền giảm giá hoặc % giảm giá' })
  @IsNumber()
  value: number;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  @IsEnum(DiscountType)
  type: DiscountType;


  @ApiProperty({ example: 5, description: 'Số lượng mã giảm giá (max 10)' })
  @IsNumber()
  @Min(1)
  @Max(10)
  usageLimit: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
