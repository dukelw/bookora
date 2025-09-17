import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { PurchaseInvoiceService } from './purchase-invoice.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PurchaseInvoice } from 'src/schemas/purchase-invoice.schema';
import { CreatePurchaseInvoiceDto } from './dto';

@ApiTags('Purchase Invoice')
@Controller('purchase-invoices')
export class PurchaseInvoiceController {
  constructor(private readonly service: PurchaseInvoiceService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo hóa đơn nhập sách' })
  @ApiBody({ type: CreatePurchaseInvoiceDto })
  @ApiResponse({ status: 201, description: 'Created', type: PurchaseInvoice })
  create(@Body() data: CreatePurchaseInvoiceDto) {
    return this.service.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả hóa đơn nhập' })
  @ApiResponse({ status: 200, description: 'Success', type: [PurchaseInvoice] })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết hóa đơn nhập theo ID' })
  @ApiResponse({ status: 200, description: 'Success', type: PurchaseInvoice })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật hóa đơn nhập' })
  @ApiBody({ type: CreatePurchaseInvoiceDto })
  update(@Param('id') id: string, @Body() data: CreatePurchaseInvoiceDto) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa hóa đơn nhập' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post('create-lot')
  @ApiOperation({ summary: 'Tạo hóa đơn + nhập nhiều sách 1 lần' })
  @ApiBody({ type: CreatePurchaseInvoiceDto })
  @ApiResponse({ status: 201, description: 'Created', type: Object })
  createLot(@Body() data: CreatePurchaseInvoiceDto) {
    return this.service.createInvoiceWithItems(data);
  }
}
