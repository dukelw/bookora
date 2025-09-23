import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng từ giỏ hàng của user hoặc guest' })
  createOrder(@Body() dto: CreateOrderDto) {
    if (!dto.user) throw new BadRequestException('Missing user');
    return this.orderService.createOrder(dto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Lấy tất cả đơn hàng của user/guest' })
  getOrders(@Param('userId') userId: string) {
    if (!userId) throw new BadRequestException('Missing userId');
    return this.orderService.getOrders(userId);
  }

  @Get('detail/:orderId')
  @ApiOperation({ summary: 'Xem chi tiết đơn hàng theo orderId' })
  getOrderById(@Param('orderId') orderId: string) {
    if (!orderId) throw new BadRequestException('Missing orderId');
    return this.orderService.getOrderById(orderId);
  }
}
