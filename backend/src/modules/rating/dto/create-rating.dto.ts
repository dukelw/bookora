import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class VariantSnapshotDto {
  @ApiProperty({ example: 'Rare', required: false })
  @IsOptional()
  @IsString()
  rarity?: string;

  @ApiProperty({ example: 120000, required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ example: 'https://example.com/variant.jpg', required: false })
  @IsOptional() // 👈 cho phép trống
  @IsString()
  image?: string;
}

export class CreateRatingDto {
  @ApiProperty({ example: 5, description: 'Số sao (1-5)' })
  @IsNumber()
  @Min(1)
  @Max(5)
  stars: number;

  @ApiProperty({ example: 'Sách rất hay!', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ type: VariantSnapshotDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => VariantSnapshotDto)
  variant?: VariantSnapshotDto;
}
