import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { Book } from 'src/schemas/book.schema';
import { Cart } from 'src/schemas/cart.schema';
import { SHIPPING_FEE } from 'src/constant';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
  ) {}

  async getCart(userId: string) {
    const cart = await this.cartModel
      .findOne({ userId })
      .populate({ path: 'items.book', model: 'Book' })
      .exec();
    return cart || { items: [] };
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const book = await this.bookModel.findById(dto.bookId);
    if (!book) throw new NotFoundException('Book not found');

    console.log(userId);

    const variant = book.variants.find(
      (v) => v._id.toString() === dto.variantId,
    );
    if (!variant) throw new NotFoundException('Book variant not found');

    let cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      cart = new this.cartModel({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.book.toString() === dto.bookId && item.variantId === dto.variantId,
    );

    if (existingItem) {
      existingItem.quantity += dto.quantity;
    } else {
      cart.items.push({
        book: new Types.ObjectId(dto.bookId),
        variantId: dto.variantId,
        quantity: dto.quantity,
      });
    }

    await cart.save();
    return cart;
  }

  async updateItem(userId: string, dto: UpdateCartItemDto) {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find(
      (i) => i.book.toString() === dto.bookId && i.variantId === dto.variantId,
    );
    if (!item) throw new NotFoundException('Item not in cart');

    if (dto.quantity === 0) {
      cart.items = cart.items.filter(
        (i) =>
          !(i.book.toString() === dto.bookId && i.variantId === dto.variantId),
      );
    } else {
      item.quantity = dto.quantity;
    }

    await cart.save();
    return cart;
  }

  async removeItem(userId: string, bookId: string, variantId: string) {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) throw new NotFoundException('Cart not found');

    cart.items = cart.items.filter(
      (i) => !(i.book.toString() === bookId && i.variantId === variantId),
    );

    await cart.save();
    return cart;
  }

  async cartSummary(userId: string) {
    const cart = await this.cartModel
      .findOne({ userId })
      .populate<{
        items: { book: Book; variantId: string; quantity: number }[];
      }>({
        path: 'items.book',
        model: 'Book',
      })
      .exec();

    if (!cart)
      return { total: 0, tax: 0, shipping: 0, grandTotal: 0, items: [] };

    let total = 0;
    cart.items.forEach((item) => {
      const variant = item.book.variants.find(
        (v) => v._id.toString() === item.variantId,
      );
      total += (variant?.price || 0) * item.quantity;
    });

    const tax = total * 0.1;
    const shipping = cart.items.length > 0 ? SHIPPING_FEE : 0;
    const grandTotal = total + tax + shipping;

    return { total, tax, shipping, grandTotal, items: cart.items };
  }
}
