import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Truyện tranh',
    description: 'Tên danh mục sách',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Các loại truyện tranh thiếu nhi và người lớn',
    description: 'Mô tả chi tiết danh mục',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '6-12',
    description: 'Độ tuổi phù hợp',
  })
  @IsOptional()
  @IsString()
  ageRange?: string;
}

export class UpdateCategoryDto extends CreateCategoryDto {}
