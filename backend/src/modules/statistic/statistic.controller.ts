import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistic.service';
import { TimeRangeDto } from './dto/time-range.dto';
import { TopProductsDto } from './dto/top-product.dto';

@ApiTags('Statistics')
@Controller('stats')
export class StatisticsController {
  constructor(private readonly stats: StatisticsService) {}

  // Simple dashboard overview
  @Get('overview')
  @ApiOperation({
    summary: 'Simple dashboard overview',
    description:
      'High-level metrics for the selected time range: total users, new users, orders, gross/net sales, shipping revenue, products sold, and top products.',
  })
  @ApiOkResponse({
    description: 'Overview metrics for the selected time range.',
  })
  async overview(@Query() query: TimeRangeDto) {
    return this.stats.getOverview(query);
  }

  // Advanced dashboard time-series stats
  @Get('time-series')
  @ApiOperation({
    summary: 'Advanced time-series metrics',
    description:
      'Orders, sales, discounts, shipping revenue, and products sold, grouped by year/quarter/month/week or custom range. Optional profit calculation if cost data exists.',
  })
  @ApiOkResponse({
    description: 'Time-series metrics grouped by the selected granularity.',
  })
  async timeSeries(@Query() query: TimeRangeDto) {
    return this.stats.getTimeSeries(query);
  }

  // Top/best-selling products for charts
  @Get('top-products')
  @ApiOperation({
    summary: 'Top/best-selling products',
    description:
      'Returns the best-selling products by quantity and revenue within the selected time range.',
  })
  @ApiOkResponse({
    description: 'List of top products with quantity and revenue.',
  })
  async topProducts(@Query() query: TopProductsDto) {
    return this.stats.getTopProducts(query);
  }

  // Comparative breakdown by category across time
  @Get('product-breakdown')
  @ApiOperation({
    summary: 'Product/category breakdown over time',
    description:
      'Comparative charts of quantity and revenue by category across the selected granularity and time range.',
  })
  @ApiOkResponse({
    description: 'Per-period category breakdown with quantity and revenue.',
  })
  async productBreakdown(@Query() query: TimeRangeDto) {
    return this.stats.getProductBreakdown(query);
  }
}
