import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FooterImageService } from './footer-image.service';
import { CreateFooterImageDto } from './dto/create-footer-image.dto';
import { UpdateFooterImageDto } from './dto/update-footer-image.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Footer Images')
@Controller('footer-images')
export class FooterImageController {
  constructor(private readonly service: FooterImageService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() dto: CreateFooterImageDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFooterImageDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get('public/active')
  getActive() {
    return this.service.getActiveImages();
  }
}
