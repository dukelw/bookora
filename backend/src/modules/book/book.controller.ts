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
import { BestSellersQueryDto } from './dto/book-bestsellers.dto';
import { NewReleasesQueryDto } from './dto/book-newreleases.dto';
import { AuthorsQueryDto, BooksByAuthorQueryDto } from './dto/author.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ListBooksQueryDto } from './dto/list-books.dto';

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

  @Post('reindex')
  async reindex() {
    await this.bookService.reindexAll();
    return { ok: true };
  }

  @Get('all')
  @ApiOperation({ summary: 'Lấy danh sách theo filter (có phân trang)' })
  getBooks(@Query() q: ListBooksQueryDto) {
    return this.bookService.list(q);
  }

  @Get('best-sellers')
  @ApiOperation({
    summary: 'Lấy danh sách sách bán chạy nhất (aggregation từ Orders)',
  })
  @ApiOkResponse({ description: 'Danh sách best-sellers' })
  getBestSellers(@Query() q: BestSellersQueryDto) {
    return this.bookService.getBestSellers(q);
  }

  @Get('new-releases')
  @ApiOperation({
    summary: 'Lấy danh sách sách mới phát hành (dựa vào create at)',
  })
  @ApiOkResponse({ description: 'Danh sách sách mới phát hành' })
  getNewReleases(@Query() q: NewReleasesQueryDto) {
    return this.bookService.getNewReleases(q);
  }

  @Get('authors')
  @ApiOperation({ summary: 'Lấy tất cả tác giả (distinct) + số lượng sách' })
  getAllAuthors(@Query() q: AuthorsQueryDto) {
    return this.bookService.getAllAuthors(q);
  }

  @Get('authors/:author')
  @ApiOperation({ summary: 'Lấy sách theo tên tác giả (case-insensitive)' })
  getBooksByAuthor(
    @Param('author') author: string,
    @Query() q: BooksByAuthorQueryDto,
  ) {
    // author có thể chứa dấu/space → FE nhớ encodeURIComponent khi gọi
    return this.bookService.getBooksByAuthor(author, q);
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

  @Get('by-category/:categoryId')
  @ApiOperation({
    summary: 'Lấy danh sách sách theo Category ID (có phân trang)',
  })
  @ApiParam({ name: 'categoryId', description: 'ID của category' })
  @ApiResponse({ status: 200, description: 'Danh sách sách theo category' })
  findByCategory(
    @Param('categoryId') categoryId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.bookService.findByCategory(categoryId, +page, +limit);
  }
}
