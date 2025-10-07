import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from 'src/schemas/order.schema';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo một đơn hàng mới' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Đơn hàng được tạo thành công',
    type: Order,
  })
  async create(@Body() dto: CreateOrderDto): Promise<Order> {
    return this.orderService.create(dto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Lấy tất cả đơn hàng của một user' })
  @ApiParam({ name: 'userId', description: 'ID của user' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn hàng',
    type: [Order],
  })
  async getByUser(@Param('userId') userId: string): Promise<Order[]> {
    return this.orderService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng theo ID' })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng' })
  @ApiResponse({ status: 200, description: 'Chi tiết đơn hàng', type: Order })
  async getOne(@Param('id') id: string): Promise<Order> {
    return this.orderService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng' })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: Object.values(OrderStatus) },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Đơn hàng đã được cập nhật trạng thái',
    type: Order,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ): Promise<Order> {
    return this.orderService.updateStatus(id, status);
  }
}
