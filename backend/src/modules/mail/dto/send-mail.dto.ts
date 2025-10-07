import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SendMailDto {
  @ApiProperty({ example: 'customer@example.com', description: 'Địa chỉ email người nhận' })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'Dong Duy', description: 'Tên người nhận (optional)', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Xác nhận đơn hàng', description: 'Tiêu đề email' })
  @IsString()
  subject: string;

  @ApiProperty({ example: '<b>Xin chào!</b> Đây là nội dung mail.', description: 'Nội dung email (HTML/Text)' })
  @IsString()
  content: string;
}
