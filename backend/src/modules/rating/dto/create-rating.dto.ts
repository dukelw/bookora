import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
