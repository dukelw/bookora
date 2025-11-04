import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { WishlistService } from './wishlist.service';
import {
  AddWishlistDto,
  BulkWishlistDto,
  WishlistQueryDto,
} from './dto/wishlist.dto';

@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  private userIdFromReq(req: any): string {
    const u = req?.user ?? {};
    const id = u._id || u.id || u.userId || u.sub || u.uid;
    if (!id)
      throw new UnauthorizedException(
        'Missing user. Click "Authorize" and provide a Bearer token.',
      );
    return String(id);
  }

  @Get()
  @ApiOperation({ summary: 'List wishlist books' })
  list(@Req() req: any, @Query() q: WishlistQueryDto) {
    return this.wishlistService.list(this.userIdFromReq(req), q);
  }

  @Post()
  @ApiOperation({ summary: 'Add a book to wishlist' })
  add(@Req() req: any, @Body() dto: AddWishlistDto) {
    return this.wishlistService.add(this.userIdFromReq(req), dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Add many books to wishlist' })
  addMany(@Req() req: any, @Body() dto: BulkWishlistDto) {
    return this.wishlistService.addMany(this.userIdFromReq(req), dto);
  }

  @Post('toggle')
  @ApiOperation({ summary: 'Toggle wishlist for a book' })
  toggle(@Req() req: any, @Body() dto: AddWishlistDto) {
    return this.wishlistService.toggle(this.userIdFromReq(req), dto);
  }

  @Get('status/:bookId')
  @ApiOperation({ summary: 'Check if a book is in wishlist' })
  status(@Req() req: any, @Param('bookId') bookId: string) {
    return this.wishlistService.status(this.userIdFromReq(req), bookId);
  }

  @Delete(':bookId')
  @ApiOperation({ summary: 'Remove a book from wishlist' })
  remove(@Req() req: any, @Param('bookId') bookId: string) {
    return this.wishlistService.remove(this.userIdFromReq(req), bookId);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove many books from wishlist' })
  removeMany(@Req() req: any, @Body() dto: BulkWishlistDto) {
    return this.wishlistService.removeMany(this.userIdFromReq(req), dto);
  }

  @Delete('clear/all')
  @ApiOperation({ summary: 'Clear all wishlist items' })
  clear(@Req() req: any) {
    return this.wishlistService.clear(this.userIdFromReq(req));
  }
}
