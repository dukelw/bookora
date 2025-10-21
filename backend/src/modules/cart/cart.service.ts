import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AddToCartDto,
  AdjustCartItemDto,
  UpdateCartItemDto,
  UpdateCartItemStatusDto,
} from './dto/cart.dto';
import { Book, BookVariant } from 'src/schemas/book.schema';
import { Cart, CartItemStatus } from 'src/schemas/cart.schema';
import { SHIPPING_FEE } from 'src/constant';
import { DiscountService } from '../discount/discount.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
    private readonly discountService: DiscountService,
  ) {}

  private isObjectId(id: string) {
    try {
      return Types.ObjectId.isValid(id);
    } catch {
      return false;
    }
  }

  getBookIdFromItem(item: any): string {
    if (!item) return '';
    // nếu populated: item.book._id exists
    if (item.book && (item.book._id || item.book.id)) {
      return String(item.book._id ?? item.book.id);
    }
    // nếu chưa populated, item.book có thể là ObjectId
    return String(item.book);
  }

  // Find cart by either userId (ObjectId) or guestId (string)
  async findCartByOwner(ownerId: string) {
    if (this.isObjectId(ownerId)) {
      const objId = new Types.ObjectId(ownerId);
      return this.cartModel
        .findOne({ userId: objId })
        .populate({ path: 'items.book', model: 'Book' })
        .exec();
    } else {
      return this.cartModel
        .findOne({ guestId: ownerId })
        .populate({ path: 'items.book', model: 'Book' })
        .exec();
    }
  }

  async getCart(ownerId: string) {
    let cart = await this.findCartByOwner(ownerId);

    if (!cart) {
      // create cart: if ownerId is ObjectId -> user cart, else guest cart
      const doc: any = {};
      if (this.isObjectId(ownerId)) doc.userId = new Types.ObjectId(ownerId);
      else doc.guestId = ownerId;
      cart = new this.cartModel({ ...doc, items: [] });
      await cart.save();
    }
    return cart;
  }

  async addToCart(ownerId: string, dto: AddToCartDto) {
    console.log('owner', ownerId, dto);
    const book = await this.bookModel.findById(dto.bookId);
    if (!book) throw new NotFoundException('Book not found');

    const variant = (
      book.variants as (BookVariant & { _id: Types.ObjectId })[]
    ).find((v) => v._id.toString() === dto.variantId);
    if (!variant) throw new NotFoundException('Book variant not found');

    let cart = await this.findCartByOwner(ownerId);
    if (!cart) {
      const doc: any = {};
      if (this.isObjectId(ownerId)) doc.userId = new Types.ObjectId(ownerId);
      else doc.guestId = ownerId;
      cart = new this.cartModel({ ...doc, items: [] });
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
        status: CartItemStatus.PENDING,
      });
    }

    await cart.save();
    return cart;
  }

  // Merge guest cart into user cart (called when user registers or logs in and checkout)
  // Replace the existing mergeGuestCartToUser with the following implementation
  async mergeGuestCartToUser(userId: string, guestId: string) {
    if (!this.isObjectId(userId)) throw new NotFoundException('Invalid userId');

    const userObjId = new Types.ObjectId(userId);
    const guestCart = await this.cartModel.findOne({ guestId });
    if (!guestCart) return { merged: false, message: 'No guest cart' };

    // Try to find existing userCart first
    let userCart = await this.cartModel.findOne({ userId: userObjId });

    // If there's no user cart, try to atomically assign the guest cart to the user
    if (!userCart) {
      try {
        // Atomically set userId only if userId field does not already exist on the document.
        const updated = await this.cartModel
          .findOneAndUpdate(
            { _id: guestCart._id, userId: { $exists: false } },
            { $set: { userId: userObjId }, $unset: { guestId: '' } },
            { new: true },
          )
          .exec();

        if (updated) {
          // Populate full book documents for every item before returning
          await updated.populate({ path: 'items.book' });
          // Successfully re-assigned guestCart to user without creating duplicate user cart
          return { merged: true, cart: updated };
        }

        // If updated is null, it means some other process likely created a user cart concurrently.
        // Fall through to fetch the existing userCart and merge.
        userCart = await this.cartModel.findOne({ userId: userObjId });
      } catch (err: any) {
        // If duplicate key error occurs despite the check, fall back to safe merge
        if (err?.code !== 11000) {
          // unexpected error -> rethrow
          throw err;
        }
        // else continue to merge below
        userCart = await this.cartModel.findOne({ userId: userObjId });
      }
    }

    // If we reach here and there is a userCart, merge guestCart items into userCart
    if (userCart) {
      for (const gi of guestCart.items) {
        const existing = userCart.items.find(
          (i) =>
            i.book.toString() === gi.book.toString() &&
            i.variantId === gi.variantId,
        );
        if (existing) {
          existing.quantity += gi.quantity;
        } else {
          userCart.items.push({
            book: gi.book,
            variantId: gi.variantId,
            quantity: gi.quantity,
            status: gi.status || CartItemStatus.PENDING,
          } as any);
        }
      }

      await userCart.save();

      // Populate full book documents for every item before returning
      await userCart.populate({ path: 'items.book' });

      // remove guest cart doc if it still exists
      try {
        await this.cartModel.deleteOne({ _id: guestCart._id });
      } catch (err) {
        // log but don't fail the merge — deletion can be retried/handled later
        console.error('Failed to delete guest cart after merge:', err);
      }

      return { merged: true, cart: userCart };
    }

    // Shouldn't reach here normally, but for safety:
    return { merged: false, message: 'Merge failed' };
  }

  async updateItem(userId: string, dto: UpdateCartItemDto) {
    // tìm cart an toàn bằng helper
    const cart = await this.findCartByOwner(userId);
    if (!cart) throw new NotFoundException('Cart not found');

    // đảm bảo dto.bookId/dto.variantId không có khoảng trắng lạ
    const bookId = String(dto.bookId).trim();
    const variantId = String(dto.variantId).trim();

    const item = cart.items.find(
      (i) => String(i.book) === bookId && i.variantId === variantId,
    );

    if (!item) {
      // debug helpful message
      console.warn('[cart.updateItem] Item not found in cart', {
        userId,
        bookId,
        variantId,
        itemsCount: cart.items.length,
      });
      throw new NotFoundException('Item not in cart');
    }

    if (dto.quantity === 0) {
      cart.items = cart.items.filter(
        (i) => !(String(i.book) === bookId && i.variantId === variantId),
      );
    } else {
      item.quantity = dto.quantity;
    }

    await cart.save();
    return cart;
  }

  async removeItem(ownerId: string, bookId: string, variantId: string) {
    let cart: any = null;
    try {
      if (this.isObjectId(ownerId)) {
        const objId = new Types.ObjectId(ownerId);
        cart = await this.cartModel.findOne({ userId: objId }).exec();
      }
      if (!cart) {
        cart = await this.cartModel.findOne({ guestId: ownerId }).exec();
      }
    } catch (err) {
      console.error('[cart.removeItem] findOne error:', err);
      // fallback: try loose match with string (rare)
      cart = await this.cartModel.findOne({ userId: ownerId }).exec();
    }

    if (!cart) throw new NotFoundException('Cart not found');

    cart.items = cart.items.filter(
      (i) => !(i.book.toString() === bookId && i.variantId === variantId),
    );

    await cart.save();
    return cart;
  }

  async updateItemStatus(userId: string, dto: UpdateCartItemStatusDto) {
    const cart = await this.cartModel.findOne({ userId: userId.toString() });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find(
      (i) => i.book.toString() === dto.bookId && i.variantId === dto.variantId,
    );
    if (!item) throw new NotFoundException('Item not in cart');

    item.status = dto.status;
    await cart.save();
    return cart;
  }

  async clearCart(userId: string) {
    const cart = await this.cartModel.findOne({ userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
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
      const variant = (
        item.book.variants as (BookVariant & { _id: Types.ObjectId })[]
      ).find((v) => v._id.toString() === item.variantId);
      total += (variant?.price || 0) * item.quantity;
    });

    const tax = total * 0.1;
    const shipping = cart.items.length > 0 ? SHIPPING_FEE : 0;
    const grandTotal = total + tax + shipping;

    return { total, tax, shipping, grandTotal, items: cart.items };
  }

  async applyDiscountToCart(userId: string, code: string) {
    const summary = await this.cartSummary(userId);

    if (summary.total === 0) {
      throw new NotFoundException('Cart is empty');
    }

    const { discount, discountedTotal } =
      await this.discountService.validateAndApply(code, summary.grandTotal);

    return {
      ...summary,
      discountCode: discount.code,
      discountValue: discount.value,
      grandTotalAfterDiscount: discountedTotal,
    };
  }

  async adjustItemQuantity(ownerId: string, dto: AdjustCartItemDto) {
    const cart = await this.findCartByOwner(ownerId);
    if (!cart) throw new NotFoundException('Cart not found');

    const bookId = String(dto.bookId).trim();
    const variantId = String(dto.variantId).trim();

    const index = cart.items.findIndex((i: any) => {
      const itemBookId = this.getBookIdFromItem(i);
      return itemBookId === bookId && String(i.variantId) === variantId;
    });

    if (index === -1) {
      console.warn('[cart.adjustItemQuantity] Item not found', {
        ownerId,
        bookId,
        variantId,
        itemsCount: cart.items.length,
      });
      throw new NotFoundException('Item not in cart');
    }

    const item = cart.items[index];

    if (dto.action === 'increment') {
      item.quantity = (item.quantity || 0) + 1;
    } else if (dto.action === 'decrement') {
      item.quantity = (item.quantity || 0) - 1;
      if (item.quantity <= 0) {
        // remove if zero or less
        cart.items.splice(index, 1);
      }
    } else {
      throw new NotFoundException('Invalid action');
    }

    await cart.save();
    return cart;
  }
}
