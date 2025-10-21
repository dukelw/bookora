import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo bình luận mới' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, description: 'Bình luận được tạo thành công' })
  create(@Body() dto: CreateCommentDto) {
    return this.commentService.create(dto);
  }

  @Get(':bookId')
  @ApiOperation({ summary: 'Lấy danh sách bình luận theo bookId' })
  @ApiParam({ name: 'bookId', type: String, description: 'ID của sách' })
  @ApiResponse({ status: 200, description: 'Danh sách bình luận' })
  findByBook(@Param('bookId') bookId: string) {
    return this.commentService.findByBook(bookId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật nội dung bình luận' })
  @ApiParam({ name: 'id', type: String, description: 'ID của bình luận' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({ status: 200, description: 'Bình luận đã được cập nhật' })
  update(@Param('id') id: string, @Body() dto: UpdateCommentDto) {
    return this.commentService.update(id, dto.content);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bình luận' })
  @ApiParam({ name: 'id', type: String, description: 'ID của bình luận' })
  @ApiResponse({ status: 200, description: 'Xóa bình luận thành công' })
  remove(@Param('id') id: string) {
    return this.commentService.remove(id);
  }

  @Put(':id/like/:userId')
  toggleLike(@Param('id') id: string, @Param('userId') userId: string) {
    return this.commentService.toggleLike(id, userId);
  }
}
