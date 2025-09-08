import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { SliderCollectionService } from './slider-collection.service';
import { CreateSliderCollectionDto } from './dto/create-slider-collection.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Slider Collection')
@Controller('slider-collections')
export class SliderCollectionController {
  constructor(private readonly service: SliderCollectionService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo slider collection mới' })
  @ApiResponse({ status: 201, description: 'Collection created' })
  create(@Body() dto: CreateSliderCollectionDto) {
    console.log(dto);
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách collection' })
  findAll() {
    return this.service.findAll();
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

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa collection theo ID' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/active')
  @ApiOperation({ summary: 'Kích hoạt hoặc hủy kích hoạt collection' })
  setActive(@Param('id') id: string, @Body('active') active: boolean) {
    return this.service.setActive(id, active);
  }
}
