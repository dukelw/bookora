import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID của user hoặc guest',
    example: '68c6d88efa6807f6e993178e',
  })
  @IsString()
  @IsNotEmpty()
  user: string;

  @ApiPropertyOptional({
    description: 'Mã giảm giá (5 ký tự alphanumeric, optional)',
    example: 'AB12C',
  })
  @IsOptional()
  @IsString()
  @Length(5, 5, { message: 'Discount code must be exactly 5 characters' })
  @Matches(/^[A-Za-z0-9]{5}$/, {
    message: 'Discount code must be alphanumeric',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value,
  )
  discountCode?: string;

  @ApiProperty({
    description: 'Địa chỉ giao hàng',
    example: '123 Lê Lợi, Q1, TP.HCM',
  })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;
}
