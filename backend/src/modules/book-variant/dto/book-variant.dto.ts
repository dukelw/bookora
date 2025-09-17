import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateBookVariantDto {
  @ApiProperty({ example: 'rare' })
  @IsString()
  rarity: string;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  stock: number;

  @ApiProperty({ example: 'https://abc.png', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: '978-604-123-456-7', required: false })
  @IsOptional()
  @IsString()
  isbn?: string;
}

export class UpdateBookVariantDto extends PartialType(CreateBookVariantDto) {}
