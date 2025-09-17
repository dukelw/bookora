import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateInventoryItemDto } from 'src/modules/inventory/dto';

export class CreatePurchaseInvoiceDto {
  @ApiProperty({ description: 'Số hóa đơn', example: 'HDN-001' })
  @IsNotEmpty()
  @IsString()
  invoiceNumber: string;

  @ApiProperty({ description: 'Nhà cung cấp', example: 'Nhà sách ABC' })
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
    description: 'Ghi chú',
    example: 'Nhập lô sách mới',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}
