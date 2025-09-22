import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { ApiTags, ApiOperation, ApiProperty, ApiHeader } from '@nestjs/swagger';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy giỏ hàng của người dùng hoặc guest' })
  @ApiHeader({
    name: 'x-guest-id',
    description: 'ID tạm cho người dùng chưa đăng nhập',
    required: false,
  })
  getCart(@Req() req) {
    const userId = req.user?.id || req.headers['x-guest-id'];
    return this.service.getCart(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm sách vào giỏ hàng' })
  @ApiHeader({
    name: 'x-guest-id',
    description: 'ID tạm cho người dùng chưa đăng nhập',
    required: false,
  })
  addToCart(@Req() req, @Body() dto: AddToCartDto) {
    const userId = req.user?.id || req.headers['x-guest-id'];
    return this.service.addToCart(userId, dto);
  }

  @Put()
  @ApiOperation({ summary: 'Cập nhật số lượng sách trong giỏ hàng' })
  updateItem(@Req() req, @Body() dto: UpdateCartItemDto) {
    const userId = req.user?.id || req.headers['x-guest-id'];
    return this.service.updateItem(userId, dto);
  }

  @Delete(':bookId/:variantId')
  @ApiOperation({ summary: 'Xóa sách khỏi giỏ hàng theo biến thể' })
  removeItem(
    @Req() req,
    @Param('bookId') bookId: string,
    @Param('variantId') variantId: string,
  ) {
    const userId = req.user?.id || req.headers['x-guest-id'];
    return this.service.removeItem(userId, bookId, variantId);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Tổng hợp giỏ hàng (tổng tiền, thuế, phí vận chuyển)',
  })
  cartSummary(@Req() req) {
    const userId = req.user?.id || req.headers['x-guest-id'];
    return this.service.cartSummary(userId);
  }
}
