import { Controller, Post, Get, Put, Param, Body, Req, UseGuards } from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':bookId/me')
  async getMyRating(@Param('bookId') bookId: string, @Req() req) {
    const userId = req.user._id;
    return this.ratingService.getUserRating(bookId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':bookId')
  async addRating(
    @Param('bookId') bookId: string,
    @Body() dto: CreateRatingDto,
    @Req() req,
  ) {
    const userId = req.user._id;
    return this.ratingService.addRating(bookId, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':bookId')
  async updateRating(
    @Param('bookId') bookId: string,
    @Body() dto: CreateRatingDto,
    @Req() req,
  ) {
    const userId = req.user._id;
    return this.ratingService.updateRating(bookId, userId, dto);
  }

  @Get(':bookId')
  async getRatings(@Param('bookId') bookId: string){
    return this.ratingService.getRatings(bookId);
  }

  @Get(':bookId/average')
  async getAverage(@Param('bookId') bookId: string) {
    return this.ratingService.getAverageRating(bookId);
  }
}