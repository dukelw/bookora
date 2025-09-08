import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSliderCollectionDto {
  @ApiProperty({
    example: 'Homepage Banner',
    description: 'Tên collection slider',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
