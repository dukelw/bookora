import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsMongoId, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AddWishlistDto {
  @ApiProperty({ description: 'Book ID' })
  @IsMongoId()
  bookId!: string;
}

export class BulkWishlistDto {
  @ApiProperty({ type: [String], description: 'List of book IDs' })
  @IsArray() @ArrayNotEmpty() @IsMongoId({ each: true })
  bookIds!: string[];
}

export class WishlistQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12, maximum: 50 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
  limit?: number = 12;
}
