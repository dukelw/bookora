import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class NewReleasesQueryDto {
  @ApiPropertyOptional({ description: 'Giới hạn số sách trả về', default: 12, maximum: 50 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
  limit?: number = 12;

  @ApiPropertyOptional({ description: 'Chỉ lấy sách của năm phát hành này (releaseYear)' })
  @IsOptional() @Type(() => Number) @IsInt()
  year?: number;

  @ApiPropertyOptional({ description: 'Lọc theo categoryId' })
  @IsOptional() @IsMongoId()
  category?: string;

  @ApiPropertyOptional({ description: 'Lọc theo author (exact match)' })
  @IsOptional() @IsString()
  author?: string;

  @ApiPropertyOptional({ description: 'Lọc theo publisher (exact match)' })
  @IsOptional() @IsString()
  publisher?: string;
}
