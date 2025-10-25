import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from 'src/schemas/order.schema';
import { CartService } from '../cart/cart.service';
import { DiscountService } from '../discount/discount.service';
import { DiscountType } from 'src/schemas/discount.schema';
import { Book } from 'src/schemas/book.schema';
import {
  ReviewRequest,
  ReviewRequestStatus,
} from 'src/schemas/request-review.schema';
import { GetAllOrdersDto } from './dto/get-order-dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(ReviewRequest.name)
    private reviewRequestModel: Model<ReviewRequest>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
    private readonly cartService: CartService,
    private readonly discountService: DiscountService,
  ) {}

  // replace the create method with the following (uses (i as any)._id where needed)

  async create(dto: CreateOrderDto): Promise<Order> {
    // 1. Lấy cart thật từ DB
    const cart = await this.cartService.getCart(dto.user);
    if (!cart) throw new NotFoundException('Cart not found');

    // Ensure dto.selectedItems exists and is an array of cart item _id strings.
    const selectedIds =
      Array.isArray(dto.selectedItems) && dto.selectedItems.length
        ? dto.selectedItems.map((id: any) => String(id))
        : [];

    // If no selectedIds provided, assume all items are selected (backwards compatible)
    const selectedSet = selectedIds.length
      ? new Set(selectedIds)
      : new Set(cart.items.map((i: any) => String((i as any)._id)));

    // Filter cart items to only those selected
    const selectedCartItems = cart.items.filter((i: any) =>
      selectedSet.has(String((i as any)._id)),
    );

    if (!selectedCartItems.length) {
      throw new BadRequestException(
        'No selected items in cart to create order',
      );
    }

    // 2. Lấy và validate các item đã chọn (check stock & prepare order items)
    const items = await Promise.all(
      selectedCartItems.map(async (i: any) => {
        // i.book may be populated (object) or an ObjectId
        const bookDoc = i.book as any;
        const bookId = bookDoc?._id ? String(bookDoc._id) : String(bookDoc);

        // Always fetch fresh book & variant from DB to ensure up-to-date stock/prices
        const freshBook = await this.bookModel.findById(bookId).lean();
        if (!freshBook)
          throw new NotFoundException(`Book not found: ${bookId}`);

        const freshVariant = freshBook.variants.find(
          (v: any) => String(v._id) === i.variantId,
        );
        if (!freshVariant)
          throw new BadRequestException(
            `Variant not found in DB for book ${bookId}`,
          );

        if (freshVariant.stock < i.quantity) {
          throw new BadRequestException(
            `Not enough stock for "${freshBook.title}" (variant ${freshVariant.rarity})`,
          );
        }

        // Prepare order item (include cartItemId as string)
        return {
          book: freshBook._id,
          variantId: i.variantId,
          quantity: i.quantity,
          price: freshVariant.price,
          finalPrice: freshVariant.price,
          cartItemId: String((i as any)._id),
        };
      }),
    );

    // 3. Trừ stock
    await Promise.all(
      items.map((item) =>
        this.bookModel.updateOne(
          { _id: item.book, 'variants._id': item.variantId },
          { $inc: { 'variants.$.stock': -item.quantity } },
        ),
      ),
    );

    // 4. Tính subtotal (chỉ cho các item đã chọn)
    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

    // 5. Áp dụng discount nếu có (áp dụng lên subtotal các item đã chọn)
    let discountAmount = 0;
    if (dto.discountCode) {
      const { discount } = await this.discountService.validateAndApply(
        dto.discountCode,
        subtotal,
      );

      discountAmount =
        discount.type === DiscountType.PERCENTAGE
          ? Math.floor(subtotal * (discount.value / 100))
          : discount.value;
    }

    // 6. Tính finalAmount
    const finalAmount = subtotal - discountAmount;

    // 7. Tạo order (chỉ chứa items đã chọn)
    const order = new this.orderModel({
      ...dto,
      items: items.map((i) => ({
        book: i.book,
        variantId: i.variantId,
        quantity: i.quantity,
        price: i.price,
        finalPrice: i.finalPrice,
      })),
      totalAmount: subtotal,
      discountAmount,
      finalAmount,
    });

    const savedOrder = await order.save();

    // 8. Cập nhật discount nếu có
    if (dto.discountCode) {
      await this.discountService.markAsUsed(
        dto.discountCode,
        (savedOrder._id as Types.ObjectId).toString(),
      );
    }

    // 9. Xóa các item đã đặt khỏi cart (dựa trên selected cart item _id)
    if (selectedCartItems.length > 0) {
      const selectedCartItemIds = selectedCartItems.map((i: any) =>
        String((i as any)._id),
      );
      cart.items = cart.items.filter(
        (i: any) => !selectedCartItemIds.includes(String((i as any)._id)),
      );
      await cart.save();
    }

    return savedOrder;
  }

  async findAllByUser(
    userId: string,
    page = 1,
    limit = 10,
    status?: OrderStatus,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const query: any = { user: userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .populate({
          path: 'items.book',
          select:
            'title author variants image price element description publisher images slug',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(query),
    ]);

    // ✅ Nếu là đơn completed thì enrich thêm trạng thái đánh giá
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const reviewRequests = await this.reviewRequestModel.find({
          order: order._id,
          user: userId,
        });

        const itemsWithReview = order.items.map((item) => {
          const foundRequest = reviewRequests.find(
            (r) =>
              r.book.toString() === item.book._id.toString() &&
              r.variantId === item.variantId,
          );

          return {
            ...(typeof (item as any).toObject === 'function'
              ? (item as any).toObject()
              : { ...item }),
            reviewStatus: foundRequest?.status || ReviewRequestStatus.UNKNOWN,
            reviewRequestId: foundRequest?._id || null,
          };
        });

        return {
          ...order.toObject(),
          items: itemsWithReview,
        };
      }),
    );

    return {
      data: enrichedOrders,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    const wasCancelled = order.status === OrderStatus.CANCELLED;

    // NEW: Nếu chuyển sang CANCELLED lần đầu => trả lại tồn kho + khôi phục discount
    if (status === OrderStatus.CANCELLED && !wasCancelled) {
      // Trả lại số lượng tồn kho cho từng variant trong đơn
      await Promise.all(
        order.items.map((item) =>
          this.bookModel.updateOne(
            { _id: item.book, 'variants._id': item.variantId },
            { $inc: { 'variants.$.stock': item.quantity } },
          ),
        ),
      );

      // Khôi phục 1 lượt sử dụng của discount (nếu đơn có dùng mã)
      if (order.discountCode) {
        await this.discountService.rollbackUsage(
          order.discountCode,
          (order._id as Types.ObjectId).toString(),
        );
      }
    }

    // Cập nhật trạng thái đơn
    order.status = status;
    await order.save();

    // Giữ nguyên logic tạo yêu cầu review khi COMPLETED
    if (status === OrderStatus.COMPLETED) {
      for (const item of order.items) {
        const existingRating = await this.reviewRequestModel.findOne({
          user: order.user,
          book: item.book,
          order: id,
          status: ReviewRequestStatus.COMPLETED,
        });

        if (!existingRating) {
          await this.reviewRequestModel.create({
            order: order._id,
            user: order.user,
            book: item.book,
            variantId: item.variantId,
          });
        }
      }
    }

    return order;
  }
  async findAllOrders(dto: GetAllOrdersDto) {
    const { status, userId } = dto;

    const pageNum = Math.max(1, Number(dto.page) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(dto.limit) || 10));
    const skip = (pageNum - 1) * pageSize;

    const query: any = {};
    if (status) query.status = status;
    if (userId) query.user = userId;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .populate([
          { path: 'user', select: 'name email avatar role' },
          {
            path: 'items.book',
            select:
              'title author publisher price slug images variants description',
          },
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean()
        .exec(),
      this.orderModel.countDocuments(query),
    ]);

    return {
      items: orders,
      total,
      pageNum,
      pageSize,
    };
  }
}
