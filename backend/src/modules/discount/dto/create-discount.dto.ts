import { IsNumber, IsString, Length, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDiscountDto {
  @ApiProperty({ example: 'AB12C', description: '5 ký tự' })
  @IsString()
  @Length(5, 5)
  code: string;

  @ApiProperty({ example: 50000, description: 'Đơn vị tiền VNĐ' })
  @IsNumber()
  @Min(1000)
  value: number;

  @ApiProperty({ example: 5, description: 'Số lượng mã giảm giá (max 10)' })
  @IsNumber()
  @Min(1)
  @Max(10)
  usageLimit: number;
}
