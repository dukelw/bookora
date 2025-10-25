import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ description: 'ID của sách' })
  @IsString()
  book: string;

  @ApiProperty({ description: 'ID của variant' })
  @IsString()
  variantId: string;

  @ApiProperty({ description: 'Số lượng' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Giá gốc của sản phẩm' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Giá cuối sau khi áp dụng discount' })
  @IsNumber()
  finalPrice: number;
}

export class CreateOrderDto {
  @ApiProperty({
    type: [OrderItemDto],
    description: 'Danh sách sản phẩm trong đơn',
  })
  @IsArray()
  items: OrderItemDto[];

  @ApiProperty({ description: 'Danh sách ID sản phẩm được chọn để thanh toán' })
  @IsArray()
  @IsString({ each: true })
  selectedItems: string[];

  @ApiProperty({ description: 'Tổng tiền trước giảm giá' })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ description: 'Tổng tiền phí vận chuyển' })
  @IsNumber()
  shippingFee: number;

  @ApiProperty({ description: 'Số tiền được giảm' })
  @IsNumber()
  discountAmount: number;

  @ApiProperty({ description: 'Tổng tiền cuối cùng sau giảm giá' })
  @IsNumber()
  finalAmount: number;

  @ApiPropertyOptional({ description: 'Mã giảm giá (nếu có)' })
  @IsOptional()
  @IsString()
  discountCode?: string;

  @ApiProperty({ description: 'ID người dùng đặt đơn' })
  @IsString()
  user: string;

  @ApiProperty({ description: 'Phương thức thanh toán (cod, vnpay, etc.)' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ description: 'Địa chỉ giao hàng' })
  @IsNotEmpty()
  shippingAddress: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    note?: string;
  };

  @ApiProperty({ description: 'ID cart liên quan' })
  @IsString()
  cart: string;
}
