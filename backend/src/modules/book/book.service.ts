/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Book } from 'src/schemas/book.schema';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';
import { RatingService } from '../rating/rating.service';
import { BestSellersQueryDto } from './dto/book-bestsellers.dto';
import { NewReleasesQueryDto } from './dto/book-newreleases.dto';
import { Order, OrderStatus } from 'src/schemas/order.schema';
import { ListBooksQueryDto, BookSort } from './dto/list-books.dto';
import { AuthorsQueryDto, BooksByAuthorQueryDto } from './dto/author.dto';
import { buildCategoryInList } from 'src/helpers';
import { ES_INDEX, esClient } from 'src/config/elasticsearch.client';

@Injectable()
export class BookService {
  private readonly logger = new Logger(BookService.name);

  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<Book>,
    private readonly ratingService: RatingService,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
  ) {}

  async create(dto: CreateBookDto): Promise<Book> {
    const book = new this.bookModel(dto);
    const savedBook = await book.save();
    await this.indexBook(savedBook);
    return savedBook;
  }

  // async findAll(searchKey?: string, page = 1, limit = 10) {
  //   const filter: any = {};

  //   if (searchKey) {
  //     filter.$or = [
  //       { title: { $regex: searchKey, $options: 'i' } },
  //       { author: { $regex: searchKey, $options: 'i' } },
  //     ];
  //   }

  //   const skip = (page - 1) * limit;

  //   const [items, total] = await Promise.all([
  //     this.bookModel
  //       .find(filter)
  //       .populate('category')
  //       .skip(skip)
  //       .limit(limit)
  //       .exec(),
  //     this.bookModel.countDocuments(filter),
  //   ]);

  //   return {
  //     items,
  //     total,
  //     page,
  //     limit,
  //     totalPages: Math.ceil(total / limit),
  //   };
  // }

  // Index một book lên ES (gọi sau create/update)
  async indexBook(book: any) {
    const body = {
      title: book.title,
      author: book.author,
      description: book.description,
      category: book.category
        ? {
            id: (book.category as any)._id
              ? String((book.category as any)._id)
              : String(book.category),
            name: (book.category as any).name ?? null,
          }
        : null,
      price: book.price,
      publishedAt: book.publishedAt,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    };

    try {
      await esClient.index({
        index: ES_INDEX,
        id: book._id.toString(),
        body,
        refresh: 'wait_for',
      });
    } catch (err) {
      this.logger.error('Failed to index book to ES', err);
    }
  }

  // Remove doc from ES when deleting
  async removeFromIndex(bookId: string) {
    try {
      await esClient.delete({ index: ES_INDEX, id: bookId });
    } catch (err: any) {
      // ignore not found
      if (err && err.meta && err.meta.statusCode !== 404) {
        this.logger.error('Failed to delete doc from ES', err);
      }
    }
  }

  // Reindex toàn bộ dữ liệu từ Mongo -> ES
  async reindexAll(batchSize = 500) {
    let skip = 0;
    while (true) {
      const items = await this.bookModel
        .find({})
        .populate('category')
        .skip(skip)
        .limit(batchSize)
        .exec();
      if (!items.length) break;

      const body: any[] = [];
      for (const book of items) {
        body.push({
          index: { _index: ES_INDEX, _id: (book._id as any).toString() },
        });
        body.push({
          title: book.title,
          author: book.author,
          description: book.description,
          category: book.category
            ? {
                id: (book.category as any)._id
                  ? String((book.category as any)._id)
                  : String(book.category),
                name: (book.category as any).name ?? null,
              }
            : null,
          price: book.price,
          publishedAt: (book as any).publishedAt,
          createdAt: (book as any).createdAt,
          updatedAt: (book as any).updatedAt,
        });
      }

      if (body.length) {
        await esClient.bulk({ refresh: true, body });
      }

      skip += items.length;
      if (items.length < batchSize) break;
    }
    this.logger.log('Reindex completed');
  }

  // Helper: fetch populated docs by ids and preserve ES order
  private async fetchPopulatedByIdsPreserveOrder(ids: string[]) {
    if (!ids || !ids.length) return [];
    const docs = await this.bookModel
      .find({ _id: { $in: ids } })
      .populate('category')
      .exec();
    const map = new Map(docs.map((d) => [(d._id as any).toString(), d]));
    return ids.map((id) => map.get(id));
  }

  async findAll(searchKey?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // If there's no search key, use original Mongo query for listing (unchanged behavior)
    if (!searchKey) {
      const filter: any = {};
      const [items, total] = await Promise.all([
        this.bookModel
          .find(filter)
          .populate('category')
          .skip(skip)
          .limit(limit)
          .exec(),
        this.bookModel.countDocuments(filter),
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    // If we have searchKey -> prefer ES
    try {
      const query = {
        bool: {
          should: [
            {
              multi_match: {
                query: searchKey,
                fields: ['title^3', 'author^2', 'description'],
                fuzziness: 'AUTO',
              },
            },
            {
              multi_match: {
                query: searchKey,
                type: 'phrase_prefix',
                fields: ['title', 'author'],
              },
            },
          ],
        },
      };

      // cast entire params as any to satisfy different @elastic/elasticsearch TS signatures
      const esResAny: any = await esClient.search({
        index: ES_INDEX,
        body: {
          query,
          from: skip,
          size: limit,
          sort: [{ _score: 'desc' }, { createdAt: 'desc' }],
        },
      } as any);

      // normalize access to body for different client versions
      const esBody = esResAny.body ?? esResAny;

      const total =
        typeof esBody.hits.total === 'number'
          ? esBody.hits.total
          : (esBody.hits.total?.value ?? 0);
      const hits = esBody.hits.hits ?? [];

      // If you stored enough fields in ES, you could return them directly.
      // But since you previously populated category from Mongo, we'll fetch populated docs to keep behavior consistent.
      const ids = hits.map((h: any) => h._id);
      const items = await this.fetchPopulatedByIdsPreserveOrder(ids);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (err) {
      // If ES fails, fallback to Mongo regex search (existing behavior)
      this.logger.warn(
        'ElasticSearch failed, falling back to MongoDB regex search',
        err,
      );
      const filter: any = {
        $or: [
          { title: { $regex: searchKey, $options: 'i' } },
          { author: { $regex: searchKey, $options: 'i' } },
        ],
      };

      const [items, total] = await Promise.all([
        this.bookModel
          .find(filter)
          .populate('category')
          .skip(skip)
          .limit(limit)
          .exec(),
        this.bookModel.countDocuments(filter),
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookModel.findById(id).populate('category').exec();
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async update(id: string, dto: UpdateBookDto): Promise<Book> {
    const updated = await this.bookModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Book not found');
    return updated;
  }

  async remove(id: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }

    const result = await this.bookModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Book not found');
    return result;
  }

  async findByCategory(categoryId: string, page = 1, limit = 10): Promise<any> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.bookModel
        .find({ category: categoryId })
        .populate('category')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookModel.countDocuments({ category: categoryId }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBookWithRatings(bookId: string) {
    const book = await this.bookModel.findById(bookId).lean();
    const avg = await this.ratingService.getAverageRating(bookId);
    return { ...book, averageRating: avg.avgStars, totalRatings: avg.count };
  }

  async list(q: ListBooksQueryDto) {
    const { search, sort = BookSort.NAME_ASC, page = 1, limit = 12 } = q;
    const skip = (page - 1) * limit;

    const filter: any = {};
    let projection: any = {};
    let mongoSort: any = {};
    let useText = false;

    // Search: prefer $text (for relevance), else fallback regex
    if (sort === BookSort.RELEVANCE && search?.trim()) {
      filter.$text = { $search: search.trim() };
      projection = { score: { $meta: 'textScore' } };
      mongoSort = { score: { $meta: 'textScore' } };
      useText = true;
    } else if (search?.trim()) {
      const kw = search.trim();
      filter.$or = [
        { title: { $regex: kw, $options: 'i' } },
        { author: { $regex: kw, $options: 'i' } },
        { publisher: { $regex: kw, $options: 'i' } },
        { description: { $regex: kw, $options: 'i' } },
      ];
    }

    // Sort mapping
    const SORT_MAP: Record<BookSort, any> = {
      [BookSort.NAME_ASC]: { title: 1 },
      [BookSort.NAME_DESC]: { title: -1 },
      [BookSort.PRICE_ASC]: { price: 1, title: 1 },
      [BookSort.PRICE_DESC]: { price: -1, title: 1 },
      [BookSort.RELEASE_NEW]: { releaseYear: -1, createdAt: -1 },
      [BookSort.RELEASE_OLD]: { releaseYear: 1, createdAt: 1 },
      [BookSort.CREATED_NEW]: { createdAt: -1 },
      [BookSort.CREATED_OLD]: { createdAt: 1 },
      [BookSort.RELEVANCE]: mongoSort || { createdAt: -1 },
    };

    const sortSpec = SORT_MAP[sort] || SORT_MAP[BookSort.NAME_ASC];

    // Query
    const query = this.bookModel
      .find(filter, projection)
      .sort(sortSpec)
      .skip(skip)
      .limit(limit)
      .lean();

    // For proper A-Z, Z-A, use collation (case/diacritics insensitive)
    if (sort === BookSort.NAME_ASC || sort === BookSort.NAME_DESC) {
      query.collation({ locale: 'vi', strength: 1 }); // vi for Vietnamese; strength:1 ignores case/diacritics
    }

    const [items, total] = await Promise.all([
      query.exec(),
      this.bookModel.countDocuments(filter),
    ]);

    // Attach mainImage
    const mapped = items.map((b: any) => ({
      _id: b._id,
      title: b.title,
      slug: b.slug,
      author: b.author,
      publisher: b.publisher,
      price: b.price,
      releaseYear: b.releaseYear,
      mainImage:
        (b.images || []).find((i: any) => i.isMain)?.url ||
        b.images?.[0]?.url ||
        null,
      ...(useText ? { score: b.score } : {}),
    }));

    return {
      items: mapped,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        sort,
        ...(search ? { search } : {}),
      },
    };
  }

  async getBestSellers(q: BestSellersQueryDto) {
    const {
      limit = 12,
      page = 1,
      from,
      to,
      category,
      author,
      publisher,
      includeOutOfStock = 'false',
    } = q;

    const matchOrder: any = {
      status: {
        $in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.COMPLETED],
      },
    };
    if (from || to) {
      matchOrder.createdAt = {};
      if (from) matchOrder.createdAt.$gte = new Date(from);
      if (to) matchOrder.createdAt.$lte = new Date(to);
    }

    const pipelineBase: any[] = [
      { $match: matchOrder },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.book',
          sold: { $sum: '$items.quantity' },
          lastOrderAt: { $max: '$createdAt' },
        },
      },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
    ];

    const bookMatch: any = {};
    if (category) {
      const inList = buildCategoryInList(category);
      bookMatch['book.category'] = { $in: inList };
    }
    if (author) bookMatch['book.author'] = author;
    if (publisher) bookMatch['book.publisher'] = publisher;
    if (Object.keys(bookMatch).length) pipelineBase.push({ $match: bookMatch });

    pipelineBase.push(
      {
        $addFields: {
          mainImageArr: {
            $filter: {
              input: '$book.images',
              as: 'img',
              cond: { $eq: ['$$img.isMain', true] },
            },
          },
        },
      },
      {
        $addFields: {
          mainImage: {
            $cond: [
              { $gt: [{ $size: '$mainImageArr' }, 0] },
              { $arrayElemAt: ['$mainImageArr.url', 0] },
              { $arrayElemAt: ['$book.images.url', 0] },
            ],
          },
          totalStock: { $sum: '$book.variants.stock' },
        },
      },
    );

    if (includeOutOfStock !== 'true') {
      pipelineBase.push({ $match: { totalStock: { $gt: 0 } } });
    }

    // Đếm tổng số best sellers (trước khi phân trang)
    const totalResult = await this.orderModel
      .aggregate([...pipelineBase, { $count: 'total' }])
      .exec();

    const total = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Lấy danh sách trang hiện tại
    const pipeline = [
      ...pipelineBase,
      { $sort: { sold: -1, lastOrderAt: -1 } },
      { $skip: skip },
      { $limit: Math.min(limit, 50) },
      {
        $project: {
          _id: '$book._id',
          title: '$book.title',
          slug: '$book.slug',
          author: '$book.author',
          publisher: '$book.publisher',
          price: '$book.price',
          releaseYear: '$book.releaseYear',
          mainImage: 1,
          sold: 1,
        },
      },
    ];

    const items = await this.orderModel.aggregate(pipeline).exec();

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        count: items.length,
      },
    };
  }

  async getNewReleases(q: NewReleasesQueryDto) {
    const {
      limit = 12,
      page = 1,
      from,
      days = 30,
      category,
      author,
      publisher,
    } = q;

    // Xác định ngày bắt đầu: ưu tiên `from`, nếu không có thì lấy `days` gần đây
    let start: Date | undefined;
    if (from) {
      start = new Date(from);
    } else if (days) {
      start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    }

    const filter: any = {};
    if (start) filter.createdAt = { $gte: start };

    if (category) {
      const inList = buildCategoryInList(category);
      filter.category = { $in: inList };
    }

    if (author) filter.author = author;
    if (publisher) filter.publisher = publisher;

    // Tính skip và count tổng
    const skip = (page - 1) * limit;

    const total = await this.bookModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const docs = await this.bookModel
      .find(filter)
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Math.min(limit, 50))
      .lean()
      .exec();

    const items = docs.map((b: any) => {
      const main =
        (b.images || []).find((i: any) => i.isMain)?.url || b.images?.[0]?.url;
      return {
        _id: b._id,
        title: b.title,
        slug: b.slug,
        author: b.author,
        publisher: b.publisher,
        price: b.price,
        releaseYear: b.releaseYear,
        mainImage: main || null,
        createdAt: b.createdAt,
        category: Array.isArray(b.category)
          ? b.category.map((c: any) => ({ _id: c._id, name: c.name }))
          : b.category
            ? [{ _id: b.category._id, name: b.category.name }]
            : [],
      };
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        count: items.length,
        from: start?.toISOString(),
        now: new Date().toISOString(),
      },
    };
  }

  /** Lấy danh sách tất cả tác giả (distinct) + số lượng sách mỗi tác giả */
  async getAllAuthors(q: AuthorsQueryDto) {
    const { search, page = 1, limit = 20 } = q;
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: { author: { $exists: true, $ne: '' } } },
    ];

    if (search?.trim()) {
      pipeline.push({
        $match: { author: { $regex: search.trim(), $options: 'i' } },
      });
    }

    pipeline.push(
      { $group: { _id: '$author', books: { $sum: 1 } } },
      { $sort: { _id: 1 } }, // sort theo tên tác giả A→Z
      { $skip: skip },
      { $limit: Math.min(limit, 100) },
      { $project: { _id: 0, author: '$_id', books: 1 } },
    );

    const [items, totalAgg] = await Promise.all([
      this.bookModel.aggregate(pipeline).exec(),
      // tổng distinct authors (theo filter search)
      this.bookModel
        .aggregate([
          ...(search?.trim()
            ? [
                {
                  $match: {
                    author: {
                      $exists: true,
                      $ne: '',
                      $regex: search.trim(),
                      $options: 'i',
                    },
                  },
                },
              ]
            : [{ $match: { author: { $exists: true, $ne: '' } } }]),
          { $group: { _id: '$author' } },
          { $count: 'total' },
        ])
        .exec(),
    ]);

    const total = totalAgg?.[0]?.total ?? 0;
    return {
      items,
      meta: {
        page,
        limit: Math.min(limit, 100),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Lấy sách theo tên tác giả (case-insensitive) */
  async getBooksByAuthor(authorParam: string, q: BooksByAuthorQueryDto) {
    const { page = 1, limit = 12 } = q;
    const skip = (page - 1) * limit;

    // escape regex và match chính xác theo tên (không phân biệt hoa/thường)
    const escaped = authorParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filter = { author: { $regex: `^${escaped}$`, $options: 'i' } };

    const [docs, total] = await Promise.all([
      this.bookModel
        .find(filter)
        .populate('category', '_id name') // ✅ thêm populate category
        .sort({ createdAt: -1, title: 1 })
        .skip(skip)
        .limit(Math.min(limit, 50))
        .lean()
        .collation({ locale: 'vi', strength: 1 })
        .exec(),
      this.bookModel.countDocuments(filter),
    ]);

    const items = docs.map((b: any) => {
      const main =
        (b.images || []).find((i: any) => i.isMain)?.url || b.images?.[0]?.url;

      return {
        _id: b._id,
        title: b.title,
        slug: b.slug,
        author: b.author,
        publisher: b.publisher,
        price: b.price,
        releaseYear: b.releaseYear,
        mainImage: main || null,
        images: Array.isArray(b.images) ? b.images : [], // ✅ thêm images
        category: Array.isArray(b.category)
          ? b.category.map((c: any) => ({ _id: c._id, name: c.name }))
          : b.category
            ? [{ _id: b.category._id, name: b.category.name }]
            : [], // ✅ thêm category
        createdAt: b.createdAt,
      };
    });

    return {
      items,
      meta: {
        page,
        limit: Math.min(limit, 50),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
