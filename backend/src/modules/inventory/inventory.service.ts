import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Book, BookVariant } from 'src/schemas/book.schema';
import { Inventory } from 'src/schemas/inventory.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name) private inventoryModel: Model<Inventory>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
  ) {}

  async create(data: {
    book: string;
    variant: string;
    quantity: number;
    unitPrice: number;
    purchaseInvoice: string;
    note?: string;
  }): Promise<Inventory> {
    const totalPrice = data.quantity * data.unitPrice;

    // Tạo bản ghi Inventory
    const inventory = new this.inventoryModel({
      ...data,
      totalPrice,
    });
    await inventory.save();

    // Cập nhật stock của BookVariant
    const book = await this.bookModel.findById(data.book);
    if (book) {
      const variant = (
        book.variants as (BookVariant & { _id: Types.ObjectId })[]
      ).find((v) => v._id.toString() === data.variant);

      if (variant) {
        variant.stock = (variant.stock || 0) + data.quantity;
        await book.save();
      }
    }

    return inventory;
  }

  async findAll(): Promise<Inventory[]> {
    return (
      this.inventoryModel
        .find()
        .populate('book')
        // .populate('variant')
        .populate('purchaseInvoice')
        .exec()
    );
  }

  async findOne(id: string) {
    return (
      this.inventoryModel
        .findById(id)
        .populate('book')
        // .populate('variant')
        .populate('purchaseInvoice')
        .exec()
    );
  }
}
