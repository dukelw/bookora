import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export enum UserStatus {
  ACTIVE = 'active',
  DISABLE = 'disable',
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'Email của người dùng',
  })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    example: 'strongpassword',
    description: 'Mật khẩu người dùng',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    example: 'Nguyen Van A',
    description: 'Tên hiển thị của user',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '0227727273',
    description: 'Số điện thoại của user',
  })
  @IsOptional()
  @IsString()
  phone?: string;

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

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.CUSTOMER,
    description: 'Vai trò người dùng',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    description: 'Trạng thái người dùng',
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
