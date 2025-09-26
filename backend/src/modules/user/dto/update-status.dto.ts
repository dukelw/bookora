import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({ enum: ['active', 'disable'], example: 'disable' })
  @IsIn(['active', 'disable'])
  status: 'active' | 'disable';
}
