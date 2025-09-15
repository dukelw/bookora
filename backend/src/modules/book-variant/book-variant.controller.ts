import { Controller, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BookVariantService } from './book-variant.service';
import {
  CreateBookVariantDto,
  UpdateBookVariantDto,
} from './dto/book-variant.dto';

@ApiTags('Book Variants')
@Controller('books/:bookId/variants')
export class BookVariantController {
  constructor(private readonly variantService: BookVariantService) {}

  @Post()
  @ApiOperation({ summary: 'Thêm biến thể cho sách' })
  addVariant(
    @Param('bookId') bookId: string,
    @Body() dto: CreateBookVariantDto,
  ) {
    return this.variantService.addVariant(bookId, dto);
  }

  @Put(':index')
  @ApiOperation({ summary: 'Cập nhật biến thể theo index' })
  updateVariant(
    @Param('bookId') bookId: string,
    @Param('index') index: number,
    @Body() dto: UpdateBookVariantDto,
  ) {
    return this.variantService.updateVariant(bookId, index, dto);
  }

  @Delete(':index')
  @ApiOperation({ summary: 'Xóa biến thể theo index' })
  removeVariant(
    @Param('bookId') bookId: string,
    @Param('index') index: number,
  ) {
    return this.variantService.removeVariant(bookId, index);
  }
}
