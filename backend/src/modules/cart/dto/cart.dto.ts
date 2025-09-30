import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { CartItemStatus } from 'src/schemas/cart.schema';

export class AddToCartDto {
  @ApiProperty({
    description: 'ID của user hoặc guest',
    example: '4444',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'ID của sách',
    example: '64f8e3a2b1234abcd56789ef',
  })
  @IsMongoId()
  bookId: string;

  @ApiProperty({
    description: 'ID của biến thể sách',
    example: '64f8e3a2b1234abcd56789f0',
  })
  @IsString()
  variantId: string;

  @ApiProperty({
    description: 'Số lượng muốn thêm',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'ID của user hoặc guest',
    example: '4444',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'ID của sách',
    example: '64f8e3a2b1234abcd56789ef',
  })
  @IsMongoId()
  bookId: string;

  @ApiProperty({
    description: 'ID của biến thể sách cần update',
    example: '64f8e3a2b1234abcd56789f0',
  })
  @IsString()
  variantId: string;

  @ApiProperty({
    description: 'Số lượng mới',
    example: 3,
  })
  @IsNumber()
  @Min(0)
  quantity: number;
}

export class UpdateCartItemStatusDto {
  @ApiProperty({
    description: 'ID của user hoặc guest',
    example: '4444',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsMongoId()
  bookId: string;

  @ApiProperty()
  @IsString()
  variantId: string;

  @ApiProperty({ enum: CartItemStatus })
  status: CartItemStatus;
}

export class AdjustCartItemDto {
  @ApiProperty({ description: 'ID của user', example: '4444' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'ID sách', example: 'book123' })
  @IsString()
  bookId: string;

  @ApiProperty({ description: 'ID variant', example: 'variant123' })
  @IsString()
  variantId: string;

  @ApiProperty({ description: 'Hành động tăng hay giảm', example: 'increment' })
  @IsIn(['increment', 'decrement'])
  action: 'increment' | 'decrement';
}
