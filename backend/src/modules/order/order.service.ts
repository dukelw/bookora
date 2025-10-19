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

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
    private readonly cartService: CartService,
    private readonly discountService: DiscountService,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    // 1. Lấy cart thật từ DB
    const cart = await this.cartService.getCart(dto.user);
    if (!cart) throw new NotFoundException('Cart not found');

    // 2. Lấy các item đã chọn
    const items = await Promise.all(
      cart.items.map(async (i) => {
        const book = i.book as unknown as Book;
        const variant = book.variants.find(
          (v) => (v._id as Types.ObjectId).toString() === i.variantId,
        );

        const freshBook = await this.bookModel.findById(book._id).lean();
        if (!freshBook)
          throw new NotFoundException(`Book not found: ${book._id}`);

        const freshVariant = freshBook.variants.find(
          (v: any) => v._id.toString() === i.variantId,
        );
        if (!freshVariant)
          throw new BadRequestException(`Variant not found in DB`);
        if (freshVariant.stock < i.quantity)
          throw new BadRequestException(
            `Not enough stock for "${freshBook.title}" (${freshVariant.rarity})`,
          );

        if (!variant) throw new BadRequestException('Variant not found');

        // Trừ stock
        variant.stock -= i.quantity;

        return {
          book: i.book._id,
          variantId: i.variantId,
          quantity: i.quantity,
          price: variant.price,
          finalPrice: variant.price,
        };
      }),
    );

    // Sau khi map xong, lưu luôn biến thể để update stock
    await Promise.all(
      items.map((item) =>
        this.bookModel.updateOne(
          { _id: item.book, 'variants._id': item.variantId },
          { $inc: { 'variants.$.stock': -item.quantity } },
        ),
      ),
    );

    // 3. Tính subtotal
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // 4. Áp dụng discount nếu có
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

    // 5. Tính finalAmount
    const finalAmount = subtotal - discountAmount;

    // 6. Tạo order
    const order = new this.orderModel({
      ...dto,
      items: items.map((i) => ({
        ...i,
        finalPrice: i.finalPrice - discountAmount,
      })),
      totalAmount: subtotal,
      discountAmount,
      finalAmount,
    });

    const savedOrder = await order.save();

    // 7. Cập nhật discount nếu có
    if (dto.discountCode) {
      await this.discountService.markAsUsed(
        dto.discountCode,
        (savedOrder._id as Types.ObjectId).toString(),
      );
    }

    // 8. Xóa các item đã đặt khỏi cart
    if (dto.selectedItems && dto.selectedItems.length > 0) {
      cart.items = cart.items.filter(
        (i: any) => !dto.selectedItems.includes((i._id as any).toString()),
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
  ): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const query: any = { user: userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.orderModel
        .find(query)
        .populate({
          path: 'items.book',
          select:
            'title author variants image price element description publisher images', // tuỳ schema Book
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(query),
    ]);

    return {
      data,
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
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
