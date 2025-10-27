import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterAuthDto {
  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Họ và tên của người dùng',
  })
  @IsString()
  fullname: string;

  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Email của người dùng',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678', description: 'Mật khẩu của người dùng' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '123 ABC Street', description: 'Địa chỉ giao hàng' })
  @IsOptional()
  @IsString()
  address: string;
}

export class LoginAuthDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Email của người dùng',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678', description: 'Mật khẩu của người dùng' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'refreshTokenString', description: 'Refresh token' })
  @IsString()
  token: string;
}

export class LogoutDto {
  @ApiProperty({
    description: 'Refresh token của auth đang giữ',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

export class OAuthDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Email của người dùng',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Tên hiển thị của người dùng',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Ảnh đại diện (tùy chọn)',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;
}
