import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString, Length } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: '67160e5e3a52f8c9d3a1a5c2',
    description: 'ID của người dùng',
  })
  @IsMongoId()
  user: string;

  @ApiProperty({
    example: '67160e5e3a52f8c9d3a1a5c9',
    description: 'ID của sách (book)',
  })
  @IsMongoId()
  bookId: string;

  @ApiProperty({
    example: 'Cuốn này hay cực luôn!',
    description: 'Nội dung bình luận',
  })
  @IsString()
  @Length(1, 1000)
  content: string;

  @ApiProperty({
    example: '67160e5e3a52f8c9d3a1a5f0',
    description: 'ID của comment cha (nếu là reply)',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  parentComment?: string;
}

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @ApiProperty({
    example: 'Nội dung đã chỉnh sửa',
    description: 'Nội dung mới của bình luận',
  })
  @IsString()
  @Length(1, 1000)
  content: string;
}
