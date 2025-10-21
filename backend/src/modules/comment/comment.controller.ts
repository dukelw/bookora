import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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

  // @Get(':bookId')
  // @ApiOperation({ summary: 'Lấy danh sách bình luận theo bookId' })
  // @ApiParam({ name: 'bookId', type: String, description: 'ID của sách' })
  // @ApiResponse({ status: 200, description: 'Danh sách bình luận' })
  // findByBook(@Param('bookId') bookId: string) {
  //   return this.commentService.findByBook(bookId);
  // }

  // Get top-level comments (paginated)
  @Get(':bookId')
  @ApiOperation({
    summary: 'Lấy danh sách bình luận cha theo bookId (paginated)',
  })
  @ApiParam({ name: 'bookId', type: String, description: 'ID của sách' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách bình luận cha (paginated)',
  })
  findByBook(
    @Param('bookId') bookId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '5',
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 5;
    return this.commentService.findTopLevelByBook(bookId, pageNum, limitNum);
  }

  // Get all replies (descendants) for a parent comment
  @Get(':bookId/replies/:parentId')
  @ApiOperation({ summary: 'Lấy tất cả replies cho một comment cha' })
  @ApiParam({ name: 'bookId', type: String, description: 'ID của sách' })
  @ApiParam({
    name: 'parentId',
    type: String,
    description: 'ID của comment cha',
  })
  getReplies(
    @Param('bookId') bookId: string,
    @Param('parentId') parentId: string,
  ) {
    return this.commentService.findRepliesForParent(bookId, parentId);
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
