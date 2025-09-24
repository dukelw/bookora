import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';
import {
  AddToCartDto,
  AdjustCartItemDto,
  UpdateCartItemDto,
  UpdateCartItemStatusDto,
} from './dto/cart.dto';
import { ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

class UserIdDto {
  @ApiProperty({ description: 'ID của user hoặc guest', example: '4444' })
  @IsString()
  userId: string;
}

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy giỏ hàng của người dùng hoặc guest' })
  getCart(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('Missing userId');
    return this.service.getCart(userId);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Tổng hợp giỏ hàng (tổng tiền, thuế, phí vận chuyển)',
  })
  cartSummary(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('Missing userId');
    return this.service.cartSummary(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm sách vào giỏ hàng' })
  addToCart(@Body() dto: AddToCartDto) {
    const { userId, bookId, variantId, quantity } = dto;
    if (!userId) throw new BadRequestException('Missing userId');
    return this.service.addToCart(userId, {
      userId,
      bookId,
      variantId,
      quantity,
    });
  }

  @Put()
  @ApiOperation({ summary: 'Cập nhật số lượng sách trong giỏ hàng' })
  updateItem(@Body() dto: UpdateCartItemDto) {
    const { userId, bookId, variantId, quantity } = dto;
    if (!userId) throw new BadRequestException('Missing userId');
    return this.service.updateItem(userId, {
      userId,
      bookId,
      variantId,
      quantity,
    });
  }

  @Put('item-status')
  @ApiOperation({ summary: 'Cập nhật trạng thái sách trong giỏ hàng' })
  updateItemStatus(@Body() dto: UpdateCartItemStatusDto) {
    const { userId, bookId, variantId, status } = dto;
    if (!userId) throw new BadRequestException('Missing userId');
    return this.service.updateItemStatus(userId, {
      userId,
      bookId,
      variantId,
      status,
    });
  }

  @Delete(':bookId/:variantId')
  @ApiOperation({ summary: 'Xóa sách khỏi giỏ hàng theo biến thể' })
  removeItem(
    @Param('bookId') bookId: string,
    @Param('variantId') variantId: string,
    @Body() body: UserIdDto,
  ) {
    const { userId } = body;
    console.log(userId);
    if (!userId) throw new BadRequestException('Missing userId');
    return this.service.removeItem(userId, bookId, variantId);
  }

  @Put('adjust')
  @ApiOperation({ summary: 'Tăng/Giảm số lượng sản phẩm trong giỏ hàng (±1)' })
  adjustItem(@Body() dto: AdjustCartItemDto) {
    const { userId } = dto;
    if (!userId) throw new BadRequestException('Missing userId');
    return this.service.adjustItemQuantity(userId, dto);
  }
}
