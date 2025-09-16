import { Controller, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BookImageService } from './book-image.service';
import { CreateBookImageDto, UpdateBookImageDto } from './dto/book-image.dto';

@ApiTags('Book Images')
@Controller('books/:bookId/images')
export class BookImageController {
  constructor(private readonly imageService: BookImageService) {}

  @Post()
  @ApiOperation({ summary: 'Thêm ảnh cho sách' })
  addImage(@Param('bookId') bookId: string, @Body() dto: CreateBookImageDto) {
    return this.imageService.addImage(bookId, dto);
  }

  @Put(':index')
  @ApiOperation({ summary: 'Cập nhật ảnh theo index' })
  updateImage(
    @Param('bookId') bookId: string,
    @Param('index') index: number,
    @Body() dto: UpdateBookImageDto,
  ) {
    return this.imageService.updateImage(bookId, index, dto);
  }

  @Delete(':index')
  @ApiOperation({ summary: 'Xóa ảnh theo index' })
  removeImage(@Param('bookId') bookId: string, @Param('index') index: number) {
    return this.imageService.removeImage(bookId, index);
  }
}
