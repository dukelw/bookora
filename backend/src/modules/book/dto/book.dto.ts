import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RarityType } from 'src/constant';

class BookImageDto {
  @ApiProperty({
    example: 'https://example.com/image1.jpg',
    description: 'Đường dẫn ảnh của sách',
  })
  @IsString()
  url: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Có phải ảnh chính hay không',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Thứ tự ảnh (1–5)',
  })
  @IsOptional()
  @IsNumber()
  order?: number;
}

class BookVariantDto {
  @ApiProperty({
    example: 'rare',
    description: 'Độ hiếm của sách (common, rare, limited)',
  })
  @IsEnum(RarityType)
  rarity: RarityType;

  @ApiProperty({ example: 150000, description: 'Giá bán (VNĐ)' })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 50, description: 'Số lượng tồn kho' })
  @IsNumber()
  stock: number;

  @ApiPropertyOptional({ example: '9786042116563', description: 'Mã ISBN' })
  @IsOptional()
  @IsString()
  isbn?: string;
}

export class CreateBookDto {
  @ApiProperty({ example: 'Harry Potter và Hòn Đá Phù Thủy' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'J.K. Rowling' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ example: 'NXB Trẻ' })
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiProperty({
    example: ['66f17e9fa41b8b4c06cf9d21', '66f17e9fa41b8b4c06cf9d22'],
    description: 'Danh sách ID danh mục (Category)',
  })
  @IsArray()
  @IsString({ each: true })
  category: string[];

  @ApiPropertyOptional({
    example: 'Cuốn tiểu thuyết kỳ ảo nổi tiếng toàn thế giới',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1997 })
  @IsOptional()
  @IsNumber()
  releaseYear?: number;

  @ApiProperty({
    type: [BookImageDto],
    description: 'Danh sách ảnh (ít nhất 5 ảnh)',
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BookImageDto)
  images: BookImageDto[];

  @ApiProperty({
    type: [BookVariantDto],
    description: 'Danh sách biến thể sách',
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BookVariantDto)
  variants: BookVariantDto[];
}

export class UpdateBookDto extends CreateBookDto {}
