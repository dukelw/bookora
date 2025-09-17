import {
  IsNotEmpty,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInventoryItemDto {
  @ApiProperty({ description: 'ID sách', type: String, example: '64f7a3...' })
  @IsNotEmpty()
  @IsMongoId()
  book: string;

  @ApiProperty({
    description: 'ID biến thể sách',
    type: String,
    example: '64f7a3...',
  })
  @IsNotEmpty()
  @IsMongoId()
  variant: string;

  @ApiProperty({
    description: 'Số lượng nhập',
    type: Number,
    minimum: 1,
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Giá nhập 1 biến thể',
    type: Number,
    minimum: 0,
    example: 15000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({
    description: 'ID hóa đơn nhập',
    type: String,
    example: '64f7a3...',
  })
  @IsNotEmpty()
  @IsMongoId()
  purchaseInvoice: string;

  @ApiProperty({
    description: 'Ghi chú',
    type: String,
    required: false,
    example: 'Nhập từ nhà cung cấp ABC',
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreatePurchaseInvoiceDto {
  @ApiProperty({ description: 'Số hóa đơn', type: String })
  @IsNotEmpty()
  @IsString()
  invoiceNumber: string;

  @ApiProperty({ description: 'Nhà cung cấp', type: String })
  @IsNotEmpty()
  @IsString()
  supplier: string;

  @ApiProperty({
    description: 'Danh sách sách nhập',
    type: [CreateInventoryItemDto],
  })
  @IsArray()
  @IsNotEmpty()
  items: CreateInventoryItemDto[];

  @ApiProperty({
    description: 'Ghi chú hóa đơn',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}
