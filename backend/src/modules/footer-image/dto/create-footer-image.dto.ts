import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateFooterImageDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  image: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  order?: number;
}
