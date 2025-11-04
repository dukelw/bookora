import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyHistoryQueryDto } from './dto/history.dto';

@ApiTags('Loyalty')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  private userId(req: any) {
    const id = req?.user?._id || req?.user?.id || req?.user?.sub;
    return String(id);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get loyalty balance' })
  balance(@Req() req: any) {
    return this.loyaltyService.getBalance(this.userId(req));
  }

  @Get('history')
  @ApiOperation({ summary: 'Get loyalty transactions (paging)' })
  history(@Req() req: any, @Query() q: LoyaltyHistoryQueryDto) {
    return this.loyaltyService.history(this.userId(req), q);
  }
}
