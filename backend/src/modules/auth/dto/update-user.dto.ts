import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Nguyen Van A',
    description: 'Tên hiển thị của user',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '123 Nguyen Trai, Ha Noi',
    description: 'Địa chỉ của user',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'URL ảnh đại diện của user',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    example: '456 Tran Hung Dao, HCM',
    description: 'Địa chỉ giao hàng mặc định',
  })
  @IsOptional()
  @IsString()
  shippingAddress?: string;
}
