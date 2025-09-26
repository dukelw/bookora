import { PartialType } from '@nestjs/swagger';
import { CreateFooterImageDto } from './create-footer-image.dto';

export class UpdateFooterImageDto extends PartialType(CreateFooterImageDto) {}
