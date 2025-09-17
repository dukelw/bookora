import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Inventory } from 'src/schemas/inventory.schema';
import { CreateInventoryItemDto } from './dto';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo bản ghi nhập kho' })
  @ApiBody({ type: CreateInventoryItemDto })
  @ApiResponse({ status: 201, description: 'Created', type: Inventory })
  create(@Body() data: CreateInventoryItemDto) {
    return this.service.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả bản ghi nhập kho' })
  @ApiResponse({ status: 200, description: 'Success', type: [Inventory] })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết bản ghi nhập kho theo ID' })
  @ApiResponse({ status: 200, description: 'Success', type: Inventory })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
