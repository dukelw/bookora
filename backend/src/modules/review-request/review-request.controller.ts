import { Controller, Post, Param, Get } from '@nestjs/common';
import { ReviewRequestService } from './review-request.service';

@Controller('review-requests')
export class ReviewRequestController {
  constructor(private readonly reviewRequestService: ReviewRequestService) {}

  // Lấy tất cả request của 1 user
  @Get('user/:userId')
  async getAll(@Param('userId') userId: string) {
    return this.reviewRequestService.findAllByUser(userId);
  }

  // Đánh dấu hoàn thành (mark as complete)
  @Post(':id/complete')
  async markAsComplete(@Param('id') id: string) {
    return this.reviewRequestService.markAsComplete(id);
  }
}
