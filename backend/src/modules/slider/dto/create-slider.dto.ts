import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateSliderDto {
  @ApiProperty({ example: 'Summer Sale', description: 'Tiêu đề slider' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Ảnh slider',
  })
  @IsString()
  @IsNotEmpty({ message: 'Image is required' })
  image: string;

  @ApiProperty({
    example: 'Description here',
    description: 'Mô tả slider',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '634f...', description: 'ID collection slider' })
  @IsString()
  @IsMongoId({ message: 'Collection must be a valid MongoDB ObjectId' })
  collection: string;
}
