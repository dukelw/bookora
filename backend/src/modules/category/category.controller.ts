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
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới danh mục' })
  @ApiResponse({ status: 201, description: 'Danh mục đã được tạo thành công' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả danh mục (có phân trang)' })
  @ApiResponse({ status: 200, description: 'Danh sách danh mục trả về' })
  @ApiQuery({
    name: 'keySearch',
    required: false,
    type: String,
    description:
      'Từ khóa tìm kiếm theo tên danh mục (không phân biệt hoa thường)',
    example: 'Truyện tranh',
  })
  @ApiQuery({
    name: 'pageNum',
    required: false,
    type: Number,
    description: 'Số trang (mặc định 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Số lượng item mỗi trang (mặc định 10)',
    example: 10,
  })
  async findAll(
    @Query('keySearch') keySearch?: string,
    @Query('pageNum') pageNum = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return this.categoryService.findAll(keySearch, +pageNum, +pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết 1 danh mục' })
  @ApiParam({ name: 'id', description: 'ID của danh mục' })
  @ApiResponse({ status: 200, description: 'Danh mục được tìm thấy' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật danh mục theo ID' })
  @ApiParam({ name: 'id', description: 'ID của danh mục cần update' })
  @ApiResponse({ status: 200, description: 'Danh mục đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa danh mục theo ID' })
  @ApiParam({ name: 'id', description: 'ID của danh mục cần xóa' })
  @ApiResponse({ status: 200, description: 'Danh mục đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
