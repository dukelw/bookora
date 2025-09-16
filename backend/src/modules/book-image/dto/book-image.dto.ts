import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateBookImageDto {
  @ApiProperty({ example: 'https://example.com/book.jpg' })
  @IsString()
  url: string;

  @ApiProperty({ example: true, description: 'Ảnh chính hay không' })
  @IsBoolean()
  isMain: boolean;

  @ApiProperty({ example: 1, description: 'Thứ tự hiển thị (1-5)' })
  @IsNumber()
  order: number;
}

export class UpdateBookImageDto extends PartialType(CreateBookImageDto) {}
