import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

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
  @Get(':bookId/variant/:variantId/me')
  @ApiOperation({ summary: 'Get my rating for a specific book variant' })
  @ApiOkResponse({
    description: 'Returns book, variant, and my rating (if any).',
  })
  async getMyVariantRating(
    @Param('bookId') bookId: string,
    @Param('variantId') variantId: string,
    @Req() req,
  ) {
    const userId = req.user._id;
    return this.ratingService.getUserVariantRating(bookId, variantId, userId);
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
  async getRatings(
    @Param('bookId') bookId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ratingService.getRatings(bookId, page, limit);
  }

  @Get(':bookId/average')
  async getAverage(@Param('bookId') bookId: string) {
    return this.ratingService.getAverageRating(bookId);
  }
}
