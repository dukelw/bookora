import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { RarityType } from 'src/constant';

export class CreateBookVariantDto {
  @ApiProperty({ enum: ['common', 'rare', 'limited'], example: 'rare' })
  @IsEnum(RarityType)
  rarity: RarityType;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  stock: number;

  @ApiProperty({ example: '978-604-123-456-7', required: false })
  @IsOptional()
  @IsString()
  isbn?: string;
}

export class UpdateBookVariantDto extends PartialType(CreateBookVariantDto) {}
