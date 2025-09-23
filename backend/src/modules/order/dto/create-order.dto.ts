import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: 'ID tạm hoặc userId', example: 'guest123' })
  @IsString()
  user: string;

  @ApiProperty({ description: 'Mã giảm giá nếu có', required: false })
  @IsOptional()
  @IsString()
  discountCode?: string;

  @ApiProperty({ description: 'Địa chỉ giao hàng' })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;
}
