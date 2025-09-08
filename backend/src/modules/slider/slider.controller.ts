import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { SliderService } from './slider.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Slider')
@Controller('sliders')
export class SliderController {
  constructor(private readonly service: SliderService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo slider mới' })
  @ApiResponse({ status: 201, description: 'Slider created' })
  create(@Body() dto: CreateSliderDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách slider' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy slider theo ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa slider theo ID' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/active')
  @ApiOperation({ summary: 'Kích hoạt hoặc hủy kích hoạt slider' })
  setActive(@Param('id') id: string, @Body('active') active: boolean) {
    return this.service.setActive(id, active);
  }
}
