import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderItem, OrderStatus } from 'src/schemas/order.schema';
import { CartItemStatus } from 'src/schemas/cart.schema';
import { DiscountService } from '../discount/discount.service';
import { Types } from 'mongoose'

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private cartService: CartService,
    private discountService: DiscountService,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    const { user, shippingAddress, discountCode } = dto;

    // Lấy giỏ hàng
    const cart = await this.cartService.getCart(user);
    if (!cart || cart.items.length === 0) {
      throw new NotFoundException('Cart is empty');
    }

    // Chỉ lấy những item status = PURCHASED
    const orderItems: OrderItem[] = cart.items
      .filter((i) => i.status === CartItemStatus.PURCHASED)
      .map((i) => {
        const variant = (i.book as any).variants.find(
          (v) => v._id.toString() === i.variantId,
        );
        const price = variant?.price || 0;
        return {
          book: i.book,
          variantId: i.variantId,
          quantity: i.quantity,
          price,
          finalPrice: price, // sẽ điều chỉnh nếu có discount
        };
      });

    if (orderItems.length === 0) {
      throw new NotFoundException('No items marked for purchase');
    }

    let totalAmount = orderItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );
    let finalAmount = totalAmount;
    let discountAmount = 0;

    // Nếu có discountCode
    if (discountCode) {
      const result = await this.discountService.validateAndApply(
        discountCode,
        totalAmount,
      );
      finalAmount = result.discountedTotal;
      discountAmount = totalAmount - finalAmount;
    }

    const order = new this.orderModel({
      user,
      items: orderItems,
      totalAmount,
      discountAmount,
      finalAmount,
      shippingAddress,
      status: OrderStatus.PENDING,
      discountCode,
    });

    await order.save();

    // markAsUsed sau khi order thành công
    if (discountCode) {
      await this.discountService.markAsUsed(
        discountCode,
        (order._id as Types.ObjectId).toString(),
      );
    }

    // Sau khi tạo order, xóa những item PURCHASED khỏi giỏ
    cart.items = cart.items.filter(
      (i) => i.status !== CartItemStatus.PURCHASED,
    );
    await cart.save();

    return order;
  }

  async getOrders(user: string) {
    return this.orderModel.find({ user }).sort({ createdAt: -1 }).exec();
  }

  async getOrderById(orderId: string) {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
