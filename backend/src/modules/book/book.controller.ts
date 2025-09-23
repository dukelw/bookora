import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Books')
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới sách' })
  @ApiResponse({ status: 201, description: 'Sách đã được tạo thành công' })
  create(@Body() dto: CreateBookDto) {
    return this.bookService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả sách (có phân trang)' })
  @ApiResponse({ status: 200, description: 'Danh sách sách trả về' })
  findAll(
    @Query('keySearch') searchKey?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.bookService.findAll(searchKey, +page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết 1 sách' })
  @ApiParam({ name: 'id', description: 'ID của sách' })
  @ApiResponse({ status: 200, description: 'Thông tin sách được tìm thấy' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách' })
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật sách theo ID' })
  @ApiParam({ name: 'id', description: 'ID của sách cần update' })
  @ApiResponse({ status: 200, description: 'Sách đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách' })
  update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.bookService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sách theo ID' })
  @ApiParam({ name: 'id', description: 'ID của sách cần xóa' })
  @ApiResponse({ status: 200, description: 'Sách đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách' })
  remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }
}
