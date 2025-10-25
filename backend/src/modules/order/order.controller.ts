import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from 'src/schemas/order.schema';
import { GetAllOrdersDto } from './dto/get-order-dto';

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

  @Get('all')
  @ApiOperation({
    summary: 'Lấy tất cả đơn hàng (phân trang, đầy đủ thông tin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả đơn hàng',
    schema: {
      example: { items: [], total: 0, pageNum: 1, pageSize: 10 },
    },
  })
  async getAll(
    @Query(new ValidationPipe({ transform: true })) dto: GetAllOrdersDto,
  ) {
    return this.orderService.findAllOrders(dto);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary:
      'Lấy tất cả đơn hàng của một user (có phân trang & lọc trạng thái)',
  })
  @ApiParam({ name: 'userId', description: 'ID của user' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OrderStatus,
    description: 'Lọc theo trạng thái đơn hàng',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn hàng',
    type: [Order],
  })
  async getByUser(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: OrderStatus,
  ): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    return this.orderService.findAllByUser(
      userId,
      Number(page),
      Number(limit),
      status,
    );
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
