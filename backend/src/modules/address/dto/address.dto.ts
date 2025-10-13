import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressType } from 'src/schemas/address.schema';

// CREATE
export class CreateAddressDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString() @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: '0987654321' })
  @IsString() @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'TP. Hồ Chí Minh' })
  @IsString() @IsNotEmpty()
  province!: string;

  @ApiProperty({ example: 'Quận 1' })
  @IsString() @IsNotEmpty()
  district!: string;

  @ApiProperty({ example: 'Phường Bến Nghé' })
  @IsString() @IsNotEmpty()
  ward!: string;

  @ApiProperty({ example: '123 Lê Lợi' })
  @IsString() @IsNotEmpty()
  addressLine1!: string;

  @ApiProperty({ enum: AddressType, example: AddressType.HOME })
  @IsEnum(AddressType)
  addressType!: AddressType;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @Type(() => Boolean) @IsBoolean()
  isDefault?: boolean = false;
}

// UPDATE (tất cả optional)
export class UpdateAddressDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() phone?: string;

  @IsOptional() @IsString() province?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() ward?: string;
  @IsOptional() @IsString() addressLine1?: string;

  @IsOptional() @IsEnum(AddressType) addressType?: AddressType;

  @IsOptional() @Type(() => Boolean) @IsBoolean()
  isDefault?: boolean;
}
