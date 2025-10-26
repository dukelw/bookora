import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SliderCollectionService } from './slider-collection.service';
import { CreateSliderCollectionDto } from './dto/create-slider-collection.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

@ApiTags('Slider Collection')
@Controller('slider-collections')
export class SliderCollectionController {
  constructor(private readonly service: SliderCollectionService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Tạo slider collection mới' })
  @ApiResponse({ status: 201, description: 'Collection created' })
  create(@Body() dto: CreateSliderCollectionDto) {
    console.log(dto);
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bộ sưu tập (có phân trang)' })
  @ApiResponse({ status: 200, description: 'Danh sách bộ sưu tập trả về' })
  findAll(
    @Query('keySearch') searchKey?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.service.findAll(searchKey, +page, +limit);
  }

  @Get('active')
  @ApiOperation({ summary: 'Lấy danh sách collection đang active' })
  findActive() {
    return this.service.findActiveWithActiveSliders();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy collection theo ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa collection theo ID' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/active')
  @ApiOperation({ summary: 'Kích hoạt hoặc hủy kích hoạt collection' })
  setActive(@Param('id') id: string, @Body('active') active: boolean) {
    return this.service.setActive(id, active);
  }
}
