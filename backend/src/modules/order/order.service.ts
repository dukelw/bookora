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

import { LoyaltyService } from '../loyalty/loyalty.service';
import { User } from 'src/schemas/user.schema';
import { SHIPPING_FEE, VND_PER_POINT } from 'src/constant';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(ReviewRequest.name)
    private reviewRequestModel: Model<ReviewRequest>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly cartService: CartService,
    private readonly discountService: DiscountService,
    private readonly loyaltyService: LoyaltyService,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    // 1) Cart thật
    const cart = await this.cartService.getCart(dto.user);
    if (!cart) throw new NotFoundException('Cart not found');

    // 2) Xác định cartItem được chọn
    const selectedIds =
      Array.isArray(dto.selectedItems) && dto.selectedItems.length
        ? dto.selectedItems.map((id: any) => String(id))
        : [];
    const selectedSet = selectedIds.length
      ? new Set(selectedIds)
      : new Set(cart.items.map((i: any) => String((i as any)._id)));
    const selectedCartItems = cart.items.filter((i: any) =>
      selectedSet.has(String((i as any)._id)),
    );
    if (!selectedCartItems.length) {
      throw new BadRequestException(
        'No selected items in cart to create order',
      );
    }

    // 3) Chuẩn hoá item + check tồn/giá mới nhất
    const items = await Promise.all(
      selectedCartItems.map(async (i: any) => {
        const bookDoc = i.book as any;
        const bookId = bookDoc?._id ? String(bookDoc._id) : String(bookDoc);

        const freshBook = await this.bookModel.findById(bookId).lean();
        if (!freshBook)
          throw new NotFoundException(`Book not found: ${bookId}`);

        const freshVariant = freshBook.variants.find(
          (v: any) => String(v._id) === i.variantId,
        );
        if (!freshVariant) {
          throw new BadRequestException(
            `Variant not found in DB for book ${bookId}`,
          );
        }
        if (freshVariant.stock < i.quantity) {
          throw new BadRequestException(
            `Not enough stock for "${freshBook.title}" (variant ${freshVariant.rarity})`,
          );
        }

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

    // 4) Trừ tồn
    await Promise.all(
      items.map((item) =>
        this.bookModel.updateOne(
          { _id: item.book, 'variants._id': item.variantId },
          { $inc: { 'variants.$.stock': -item.quantity } },
        ),
      ),
    );

    // 5) Subtotal
    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

    // 6) Discount
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

    // 7) Final trước loyalty
    const shippingFee = Number(dto.shippingFee || SHIPPING_FEE);
    const finalBefore = Math.max(0, subtotal - discountAmount + shippingFee);

    // 8) Loyalty: tính số điểm dùng & trừ
    const uid = new Types.ObjectId(dto.user as any);
    const user = await this.userModel
      .findById(uid)
      .select('loyaltyPoints')
      .lean();
    if (!user) throw new BadRequestException('User not found');

    const requested = Math.max(0, Number(dto.loyaltyPointsUsed || 0));
    const maxByMoney = Math.floor(finalBefore / VND_PER_POINT);
    const used = Math.min(requested, user.loyaltyPoints, maxByMoney);

    if (used > 0) {
      await this.loyaltyService.redeem(uid, null, used); // reserve: trừ ngay
    }

    const loyaltyDiscountAmount = !isNaN(used * VND_PER_POINT)
      ? used * VND_PER_POINT
      : 0;
    const finalAmount = Math.max(0, finalBefore - loyaltyDiscountAmount);

    // 9) Tạo đơn (1 lần, không redeclare)
    const createPayload: any = {
      ...dto,
      items: items.map((i) => ({
        book: i.book,
        variantId: i.variantId,
        quantity: i.quantity,
        price: i.price,
        finalPrice: i.finalPrice,
      })),
      totalAmount: subtotal,
      shippingFee,
      discountAmount,
      finalAmount,
      loyaltyPointsUsed: Number(used) || 0,
      loyaltyDiscountAmount: Number(loyaltyDiscountAmount),
      loyaltyPointsEarned: 0, // sẽ cộng khi PAID/SHIPPED
      statusHistory: [
        {
          status: OrderStatus.PENDING,
          updatedAt: new Date(),
        },
      ],
    };
    const createdOrder = await this.orderModel.create(createPayload);

    // 10) Ghi nhận dùng discount
    if (dto.discountCode) {
      await this.discountService.markAsUsed(
        dto.discountCode,
        (createdOrder._id as Types.ObjectId).toString(),
      );
    }

    // 11) Xoá item khỏi cart
    if (selectedCartItems.length > 0) {
      const selectedCartItemIds = new Set(
        selectedCartItems.map((i: any) => String((i as any)._id)),
      );
      cart.items = cart.items.filter(
        (i: any) => !selectedCartItemIds.has(String((i as any)._id)),
      );
      await cart.save();
    }

    return createdOrder;
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

    const prevStatus = order.status;
    const switchingToCancelledFirstTime =
      status === OrderStatus.CANCELLED && prevStatus !== OrderStatus.CANCELLED;

    // 1) Huỷ lần đầu: trả tồn + rollback discount + hoàn điểm nếu chưa PAID/SHIPPED
    if (switchingToCancelledFirstTime) {
      await Promise.all(
        order.items.map((item) =>
          this.bookModel.updateOne(
            { _id: item.book, 'variants._id': item.variantId },
            { $inc: { 'variants.$.stock': item.quantity } },
          ),
        ),
      );

      if (order.discountCode) {
        await this.discountService.rollbackUsage(
          order.discountCode,
          (order._id as Types.ObjectId).toString(),
        );
      }

      if (
        prevStatus !== OrderStatus.PAID &&
        prevStatus !== OrderStatus.SHIPPED &&
        (order.loyaltyPointsUsed || 0) > 0
      ) {
        await this.loyaltyService.refund(
          order.user as any as Types.ObjectId,
          order._id as any as Types.ObjectId,
          order.loyaltyPointsUsed,
        );
      }
    }

    // 2) Gán trạng thái
    order.status = status;
    order.statusHistory.push({
      status,
      updatedAt: new Date(),
    });

    // 3) PAID/SHIPPED lần đầu -> cộng điểm
    if (
      (status === OrderStatus.PAID || status === OrderStatus.SHIPPED) &&
      (order.loyaltyPointsEarned || 0) === 0
    ) {
      const earned = await this.loyaltyService.earn(
        order.user as any as Types.ObjectId,
        order._id as any as Types.ObjectId,
        Math.max(0, order.finalAmount || 0),
      );
      order.loyaltyPointsEarned = earned;
    }

    await order.save();

    // 4) COMPLETED -> tạo request review nếu chưa có
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
    const { status, userId, timePreset, dateRange } = dto;

    // ---- Pagination ----
    const pageNum = Math.max(1, Number(dto.page) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(dto.limit) || 20)); // default 20
    const skip = (pageNum - 1) * pageSize;

    // ---- Build query ----
    const query: any = {};
    if (status) query.status = status;
    if (userId) query.user = userId;

    // ---- Filter theo thời gian ----
    if (timePreset) {
      const now = new Date();
      let start: Date | undefined;
      let end: Date | undefined;

      switch (timePreset) {
        case 'today':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = new Date(start);
          end.setDate(end.getDate() + 1);
          break;

        case 'yesterday':
          start = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1,
          );
          end = new Date(start);
          end.setDate(end.getDate() + 1);
          break;

        case 'this_week': {
          const dayOfWeek = now.getDay(); // 0 (Chủ nhật) - 6 (Thứ bảy)
          start = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - dayOfWeek,
          );
          end = new Date(start);
          end.setDate(end.getDate() + 7);
          break;
        }

        case 'this_month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;

        case 'custom':
          if (dateRange) {
            const [startStr, endStr] = dateRange.split(',');
            start = new Date(startStr);
            end = new Date(endStr);
            end.setDate(end.getDate() + 1); // bao gồm ngày cuối
          }
          break;
      }

      if (start && end) {
        query.createdAt = { $gte: start, $lt: end };
      }
    }

    // ---- Query database ----
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
        .sort({ createdAt: -1 }) // mới nhất lên đầu
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
