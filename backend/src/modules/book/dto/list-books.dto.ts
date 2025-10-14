import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum BookSort {
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  RELEASE_NEW = 'release_new',  // releaseYear desc
  RELEASE_OLD = 'release_old',  // releaseYear asc
  CREATED_NEW = 'created_new',  // createdAt desc
  CREATED_OLD = 'created_old',  // createdAt asc
  RELEVANCE = 'relevance',      // requires search
}

export class ListBooksQueryDto {
  @ApiPropertyOptional({ description: 'Từ khóa' })
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: BookSort, default: BookSort.NAME_ASC })
  @IsOptional() @IsEnum(BookSort)
  sort?: BookSort = BookSort.NAME_ASC;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12, maximum: 50 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
  limit?: number = 12;
}
