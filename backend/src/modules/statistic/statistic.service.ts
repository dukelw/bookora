/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Book } from 'src/schemas/book.schema';
import { Category } from 'src/schemas/category.schema';
import { Order, OrderStatus } from 'src/schemas/order.schema';
import { User } from 'src/schemas/user.schema';
import { TimeRangeDto } from './dto/time-range.dto';
import { COMPLETED_ORDER_STATUSES, Granularity } from 'src/enums';
import { TopProductsDto } from './dto/top-product.dto';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(Book.name) private readonly bookModel: Model<Book>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async getOverview(query: TimeRangeDto) {
    const { from, to } = this.normalizeRange(query);

    const [totalUsers, newUsers, orderAgg] = await Promise.all([
      this.userModel.countDocuments().lean(),
      this.userModel
        .countDocuments(this.dateMatch(from, to, 'createdAt'))
        .lean(),
      this.orderModel
        .aggregate([
          {
            $match: {
              ...this.dateMatch(from, to, 'createdAt'),
              status: { $in: [...COMPLETED_ORDER_STATUSES] as OrderStatus[] },
            },
          },
          {
            $group: {
              _id: null,
              orders: { $sum: 1 },
              grossSales: { $sum: '$totalAmount' },
              discounts: { $sum: '$discountAmount' },
              netSales: { $sum: '$finalAmount' }, // after discounts (order-level)
              shippingRevenue: { $sum: '$shippingFee' },
              productsSold: { $sum: { $sum: '$items.quantity' } },
            },
          },
        ])
        .exec(),
    ]);

    const ordersSummary = orderAgg[0] ?? {
      orders: 0,
      grossSales: 0,
      discounts: 0,
      netSales: 0,
      shippingRevenue: 0,
      productsSold: 0,
    };

    const topProducts = await this.getTopProducts({
      ...query,
      limit: query.limit ?? 5,
    });

    return {
      range: { from, to },
      totals: {
        totalUsers,
        newUsers,
        orders: ordersSummary.orders,
        grossSales: ordersSummary.grossSales,
        discounts: ordersSummary.discounts,
        netSales: ordersSummary.netSales,
        shippingRevenue: ordersSummary.shippingRevenue,
        productsSold: ordersSummary.productsSold,
        profit: 0,
      },
      topProducts: topProducts.items,
    };
  }

  async getTimeSeries(query: TimeRangeDto) {
    const { from, to } = this.normalizeRange(query);
    const tz = query.tz ?? 'UTC';
    const granularity = (query.granularity ?? 'year') as Granularity;

    const pipeline: PipelineStage[] = [
      {
        $match: {
          ...this.dateMatch(from, to, 'createdAt'),
          status: { $in: COMPLETED_ORDER_STATUSES as unknown as OrderStatus[] },
        },
      },
      { $set: { itemsQty: { $sum: '$items.quantity' } } },
      ...this.periodProject(granularity, tz),
      {
        $group: {
          _id: '$__period.key',
          start: { $first: '$__period.start' },
          end: { $first: '$__period.end' },
          label: { $first: '$__period.label' },
          orders: { $sum: 1 },
          grossSales: { $sum: '$totalAmount' },
          discounts: { $sum: '$discountAmount' },
          netSales: { $sum: '$finalAmount' },
          shippingRevenue: { $sum: '$shippingFee' },
          productsSold: { $sum: '$itemsQty' },
        },
      },
      { $sort: { start: 1 } },
      {
        $project: {
          _id: 0,
          key: '$_id',
          period: { start: '$start', end: '$end', label: '$label' },
          metrics: {
            orders: '$orders',
            grossSales: '$grossSales',
            discounts: '$discounts',
            netSales: '$netSales',
            shippingRevenue: '$shippingRevenue',
            productsSold: '$productsSold',
          },
        },
      },
    ];

    let series = await this.orderModel.aggregate(pipeline).exec();

    // Không tính profit nữa

    // Fill gaps để đảm bảo mỗi kỳ đều có dữ liệu (0 nếu trống)
    series = this.fillTimeSeriesGaps(series, from, to, granularity, tz);

    return { range: { from, to }, granularity, tz, series };
  }

  private fillTimeSeriesGaps(
    series: any[],
    from: Date,
    to: Date,
    granularity: Granularity,
    tz: string,
  ) {
    // Map existing series by key for quick lookup
    const map = new Map<string, any>(series.map((s) => [s.key, s]));

    const buckets = this.buildAllPeriods(from, to, granularity, tz);

    const zeroMetrics = () => ({
      orders: 0,
      grossSales: 0,
      discounts: 0,
      netSales: 0,
      shippingRevenue: 0,
      productsSold: 0,
    });

    const filled = buckets.map((b) => {
      const found = map.get(b.key);
      if (found) return found;
      return {
        key: b.key,
        period: { start: b.start, end: b.end, label: b.label },
        metrics: zeroMetrics(),
      };
    });

    // Ensure sorted by period start
    filled.sort(
      (a, b) =>
        new Date(a.period.start).getTime() - new Date(b.period.start).getTime(),
    );
    return filled;
  }

  private buildAllPeriods(
    from: Date,
    to: Date,
    granularity: Granularity,
    tz: string,
  ) {
    // Lưu ý: xử lý theo UTC để đơn giản. Nếu cần TZ sâu hơn, cân nhắc thư viện date-fns-tz/dayjs.
    const start = new Date(from);
    const end = new Date(to);

    const pads2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

    const periods: { key: string; start: Date; end: Date; label: string }[] =
      [];

    if (granularity === 'year') {
      const sYear = start.getUTCFullYear();
      const eYear = end.getUTCFullYear();
      for (let y = sYear; y <= eYear; y++) {
        const pStart = new Date(Date.UTC(y, 0, 1, 0, 0, 0));
        const pEnd = new Date(Date.UTC(y, 11, 31, 23, 59, 59));
        periods.push({
          key: `${y}`,
          start: pStart,
          end: pEnd,
          label: `${y}`,
        });
      }
      return periods;
    }

    if (granularity === 'quarter') {
      // Bắt đầu từ đầu quý chứa 'from'
      let y = start.getUTCFullYear();
      let m = start.getUTCMonth(); // 0-11
      let q = Math.floor(m / 3) + 1;
      // normalize to first month of quarter
      m = (q - 1) * 3;

      while (true) {
        const pStart = new Date(Date.UTC(y, m, 1, 0, 0, 0));
        const lastMonth = m + 2;
        const pEnd = new Date(Date.UTC(y, lastMonth + 1, 0, 23, 59, 59)); // day 0 of next month = last day of quarter
        const key = `${y}-Q${q}`;
        const label = `Q${q} ${y}`;
        periods.push({ key, start: pStart, end: pEnd, label });

        // advance to next quarter
        q++;
        if (q > 4) {
          q = 1;
          y++;
        }
        m = (q - 1) * 3;
        if (pStart > end) break;
        if (y > end.getUTCFullYear() + 1) break; // safety
        if (
          pStart.getTime() >=
          Date.UTC(
            end.getUTCFullYear(),
            end.getUTCMonth(),
            end.getUTCDate(),
            23,
            59,
            59,
          )
        )
          break;
        // stop when the next period start is after 'to'
        const nextStart = Date.UTC(y, m, 1, 0, 0, 0);
        if (nextStart > end.getTime()) break;
      }
      return periods.filter((p) => p.end >= start && p.start <= end);
    }

    if (granularity === 'month') {
      const y = start.getUTCFullYear();
      const m = start.getUTCMonth(); // 0-11

      // normalize to first day of month
      let cursor = new Date(Date.UTC(y, m, 1, 0, 0, 0));
      while (cursor <= end) {
        const cy = cursor.getUTCFullYear();
        const cm = cursor.getUTCMonth();
        const pStart = new Date(Date.UTC(cy, cm, 1, 0, 0, 0));
        const pEnd = new Date(Date.UTC(cy, cm + 1, 0, 23, 59, 59)); // day 0 of next month
        const key = `${cy}-${pads2(cm + 1)}`;
        const label = `${pads2(cm + 1)}/${cy}`;
        periods.push({ key, start: pStart, end: pEnd, label });

        // next month
        cursor = new Date(Date.UTC(cy, cm + 1, 1, 0, 0, 0));
      }
      return periods.filter((p) => p.end >= start && p.start <= end);
    }

    // week (ISO week with Monday start approximation in UTC)
    {
      // Find Monday of the week containing 'from'
      const startUTC = new Date(
        Date.UTC(
          start.getUTCFullYear(),
          start.getUTCMonth(),
          start.getUTCDate(),
          0,
          0,
          0,
        ),
      );
      const day = startUTC.getUTCDay();
      const diffToMonday = (day + 6) % 7;
      const cursor = new Date(startUTC);
      cursor.setUTCDate(cursor.getUTCDate() - diffToMonday);

      while (cursor <= end) {
        const pStart = new Date(cursor);
        const pEnd = new Date(cursor);
        pEnd.setUTCDate(pEnd.getUTCDate() + 6);
        pEnd.setUTCHours(23, 59, 59, 0);

        // ISO week/year
        const iso = this.isoWeekAndYear(pStart);
        const key = `${iso.year}-W${pads2(iso.week)}`;
        const label = `W${pads2(iso.week)} ${iso.year}`;

        periods.push({ key, start: pStart, end: pEnd, label });

        // next week
        cursor.setUTCDate(cursor.getUTCDate() + 7);
      }
      return periods.filter((p) => p.end >= start && p.start <= end);
    }
  }

  private isoWeekAndYear(d: Date) {
    // Clone date
    const date = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    );
    // Set to nearest Thursday: current date + 4 - current day number (Monday=1,... Sunday=7)
    const dayNum = (date.getUTCDay() + 6) % 7;
    date.setUTCDate(date.getUTCDate() - dayNum + 3);
    // January 4 is always in week 1
    const jan4 = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
    // Number of days between date and jan4
    const diff = (date.getTime() - jan4.getTime()) / 86400000;
    const week = 1 + Math.floor(diff / 7);
    const year = date.getUTCFullYear();
    return { year, week };
  }

  async getTopProducts(query: TopProductsDto) {
    const { from, to } = this.normalizeRange(query);
    const limit = query.limit ?? 10;

    const items = await this.orderModel
      .aggregate([
        {
          $match: {
            ...this.dateMatch(from, to, 'createdAt'),
            status: {
              $in: COMPLETED_ORDER_STATUSES as unknown as OrderStatus[],
            },
          },
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.book',
            quantity: { $sum: '$items.quantity' },
            // revenue = finalPrice (đơn giá sau giảm) * quantity
            revenue: {
              $sum: { $multiply: ['$items.finalPrice', '$items.quantity'] },
            },
          },
        },
        { $sort: { quantity: -1, revenue: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'books',
            localField: '_id',
            foreignField: '_id',
            as: 'book',
          },
        },
        { $unwind: '$book' },

        // (Tuỳ chọn) Populate categories để có tên/slug thay vì chỉ ObjectId
        {
          $lookup: {
            from: 'categories',
            localField: 'book.category',
            foreignField: '_id',
            as: 'categories',
          },
        },

        // Trả về toàn bộ book + mảng categories đã populate
        {
          $project: {
            _id: 0,
            bookId: '$_id',
            quantity: 1,
            revenue: 1,
            book: '$book',
            categories: {
              $map: {
                input: '$categories',
                as: 'c',
                in: { _id: '$$c._id', name: '$$c.name', slug: '$$c.slug' },
              },
            },
          },
        },
      ])
      .exec();

    return { range: { from, to }, count: items.length, items };
  }

  async getProductBreakdown(query: TimeRangeDto) {
    const { from, to } = this.normalizeRange(query);
    const tz = query.tz ?? 'UTC';
    const granularity = (query.granularity ?? 'year') as Granularity;

    const pipeline: PipelineStage[] = [
      {
        $match: {
          ...this.dateMatch(from, to, 'createdAt'),
          status: { $in: COMPLETED_ORDER_STATUSES as unknown as OrderStatus[] },
        },
      },
      ...this.periodProject(granularity, tz),

      // Mỗi item là 1 dòng
      { $unwind: '$items' },

      // Join Book
      {
        $lookup: {
          from: 'books',
          localField: 'items.book',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },

      // Join Categories theo cả mảng book.category (có thể rỗng)
      {
        $lookup: {
          from: 'categories',
          localField: 'book.category', // là mảng ObjectId
          foreignField: '_id',
          as: 'categories', // mảng category docs (có thể rỗng)
        },
      },

      // Nếu không có category nào, gán vào "Uncategorized" để không bị rơi doc
      {
        $addFields: {
          categoriesFilled: {
            $cond: [
              { $gt: [{ $size: '$categories' }, 0] },
              '$categories',
              [{ _id: 'uncategorized', name: 'Uncategorized' }],
            ],
          },
        },
      },
      { $unwind: '$categoriesFilled' },

      // Gom theo kỳ + category
      {
        $group: {
          _id: {
            period: '$__period.key',
            categoryId: '$categoriesFilled._id',
          },
          periodStart: { $first: '$__period.start' },
          periodLabel: { $first: '$__period.label' },
          categoryName: { $first: '$categoriesFilled.name' },
          quantity: { $sum: '$items.quantity' },
          revenue: {
            $sum: { $multiply: ['$items.finalPrice', '$items.quantity'] },
          },
        },
      },
      { $sort: { periodStart: 1, quantity: -1 } },

      // Chuẩn bị payload theo từng kỳ
      {
        $group: {
          _id: '$_id.period',
          period: {
            $first: {
              key: '$_id.period',
              start: '$periodStart',
              label: '$periodLabel',
            },
          },
          categories: {
            $push: {
              categoryId: '$_id.categoryId',
              categoryName: '$categoryName',
              quantity: '$quantity',
              revenue: '$revenue',
            },
          },
        },
      },
      { $sort: { 'period.start': 1 } },
      { $project: { _id: 0 } },
    ];

    const result = await this.orderModel.aggregate(pipeline).exec();
    return { range: { from, to }, granularity, tz, periods: result };
  }

  private normalizeRange(query: { from?: Date; to?: Date }) {
    // Default range: last 365 days
    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from
      ? new Date(query.from)
      : new Date(to.getTime() - 365 * 24 * 60 * 60 * 1000);
    return { from, to };
  }

  private dateMatch(from?: Date, to?: Date, field: string = 'createdAt') {
    const m: Record<string, any> = {};
    if (from || to) {
      m[field] = {};
      if (from) m[field]['$gte'] = from;
      if (to) m[field]['$lte'] = to;
    }
    return m;
  }

  // Builds a consistent period projection with label, start, end per doc
  private periodProject(granularity: Granularity, tz: string): PipelineStage[] {
    switch (granularity) {
      case 'year':
        return [
          {
            $addFields: {
              __period: {
                key: {
                  $dateToString: {
                    date: '$createdAt',
                    timezone: tz,
                    format: '%Y',
                  },
                },
                label: {
                  $dateToString: {
                    date: '$createdAt',
                    timezone: tz,
                    format: '%Y',
                  },
                },
                start: {
                  $dateFromParts: {
                    year: { $year: { date: '$createdAt', timezone: tz } },
                    month: 1,
                    day: 1,
                    timezone: tz,
                  },
                },
                end: {
                  $dateFromParts: {
                    year: { $year: { date: '$createdAt', timezone: tz } },
                    month: 12,
                    day: 31,
                    hour: 23,
                    minute: 59,
                    second: 59,
                    timezone: tz,
                  },
                },
              },
            },
          },
        ];
      case 'quarter':
        return [
          {
            $addFields: {
              __y: { $year: { date: '$createdAt', timezone: tz } },
              __m: { $month: { date: '$createdAt', timezone: tz } },
            },
          },
          {
            $addFields: {
              __q: { $ceil: { $divide: ['$__m', 3] } },
            },
          },
          {
            $addFields: {
              __period: {
                key: {
                  $concat: [{ $toString: '$__y' }, '-Q', { $toString: '$__q' }],
                },
                label: {
                  $concat: [
                    'Q',
                    { $toString: '$__q' },
                    ' ',
                    { $toString: '$__y' },
                  ],
                },
                start: {
                  $dateFromParts: {
                    year: '$__y',
                    month: {
                      $add: [{ $multiply: [{ $subtract: ['$__q', 1] }, 3] }, 1],
                    },
                    day: 1,
                    timezone: tz,
                  },
                },
                end: {
                  $dateFromParts: {
                    year: '$__y',
                    month: { $multiply: ['$__q', 3] },
                    day: {
                      // last day of quarter: take first day of next month minus one day
                      $let: {
                        vars: {
                          nextMonth: { $add: [{ $multiply: ['$__q', 3] }, 1] },
                        },
                        in: {
                          $dayOfMonth: {
                            $dateSubtract: {
                              startDate: {
                                $dateFromParts: {
                                  year: '$__y',
                                  month: '$$nextMonth',
                                  day: 1,
                                  timezone: tz,
                                },
                              },
                              unit: 'day',
                              amount: 1,
                            },
                          },
                        },
                      },
                    },
                    hour: 23,
                    minute: 59,
                    second: 59,
                    timezone: tz,
                  },
                },
              },
            },
          },
          { $project: { __y: 0, __m: 0, __q: 0 } },
        ];
      case 'month':
        return [
          {
            $addFields: {
              __y: { $year: { date: '$createdAt', timezone: tz } },
              __m: { $month: { date: '$createdAt', timezone: tz } },
            },
          },
          {
            $addFields: {
              __period: {
                key: {
                  $concat: [
                    { $toString: '$__y' },
                    '-',
                    {
                      $cond: [
                        { $lt: ['$__m', 10] },
                        { $concat: ['0', { $toString: '$__m' }] },
                        { $toString: '$__m' },
                      ],
                    },
                  ],
                },
                label: {
                  $concat: [
                    {
                      $cond: [
                        { $lt: ['$__m', 10] },
                        { $concat: ['0', { $toString: '$__m' }] },
                        { $toString: '$__m' },
                      ],
                    },
                    '/',
                    { $toString: '$__y' },
                  ],
                },
                start: {
                  $dateFromParts: {
                    year: '$__y',
                    month: '$__m',
                    day: 1,
                    timezone: tz,
                  },
                },
                end: {
                  $dateFromParts: {
                    year: '$__y',
                    month: '$__m',
                    day: {
                      $dayOfMonth: {
                        $dateSubtract: {
                          startDate: {
                            $dateFromParts: {
                              year: '$__y',
                              month: { $add: ['$__m', 1] },
                              day: 1,
                              timezone: tz,
                            },
                          },
                          unit: 'day',
                          amount: 1,
                        },
                      },
                    },
                    hour: 23,
                    minute: 59,
                    second: 59,
                    timezone: tz,
                  },
                },
              },
            },
          },
          { $project: { __y: 0, __m: 0 } },
        ];
      case 'week':
      default:
        return [
          {
            $addFields: {
              __iw: { $isoWeek: { date: '$createdAt', timezone: tz } },
              __iwy: { $isoWeekYear: { date: '$createdAt', timezone: tz } },
            },
          },
          {
            $addFields: {
              __period: {
                key: {
                  $concat: [
                    { $toString: '$__iwy' },
                    '-W',
                    {
                      $cond: [
                        { $lt: ['$__iw', 10] },
                        { $concat: ['0', { $toString: '$__iw' }] },
                        { $toString: '$__iw' },
                      ],
                    },
                  ],
                },
                label: {
                  $concat: [
                    'W',
                    {
                      $cond: [
                        { $lt: ['$__iw', 10] },
                        { $concat: ['0', { $toString: '$__iw' }] },
                        { $toString: '$__iw' },
                      ],
                    },
                    ' ',
                    { $toString: '$__iwy' },
                  ],
                },
                // Start of ISO week: dateTrunc if available, else approximate using $dateFromParts + math
                start: {
                  $dateTrunc: {
                    date: '$createdAt',
                    unit: 'week',
                    binSize: 1,
                    timezone: tz,
                    startOfWeek: 'monday',
                  },
                },
                end: {
                  $dateAdd: {
                    startDate: {
                      $dateTrunc: {
                        date: '$createdAt',
                        unit: 'week',
                        binSize: 1,
                        timezone: tz,
                        startOfWeek: 'monday',
                      },
                    },
                    unit: 'day',
                    amount: 6,
                  },
                },
              },
            },
          },
          { $project: { __iw: 0, __iwy: 0 } },
        ];
    }
  }
}
