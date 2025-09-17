import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PurchaseInvoice } from 'src/schemas/purchase-invoice.schema';
import { CreatePurchaseInvoiceDto } from './dto';
import { Book, BookVariant } from 'src/schemas/book.schema';
import { Inventory } from 'src/schemas/inventory.schema';

@Injectable()
export class PurchaseInvoiceService {
  constructor(
    @InjectModel(PurchaseInvoice.name)
    private invoiceModel: Model<PurchaseInvoice>,
    @InjectModel(Inventory.name) private inventoryModel: Model<Inventory>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
  ) {}

  async create(data: CreatePurchaseInvoiceDto) {
    const invoice = new this.invoiceModel(data);
    return invoice.save();
  }

  async findAll(): Promise<PurchaseInvoice[]> {
    return this.invoiceModel.find().sort({ invoiceDate: -1 }).exec();
  }

  async findOne(id: string) {
    return this.invoiceModel.findById(id).exec();
  }

  async update(id: string, data: CreatePurchaseInvoiceDto) {
    return this.invoiceModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string) {
    return this.invoiceModel.findByIdAndDelete(id).exec();
  }

  async createInvoiceWithItems(data: CreatePurchaseInvoiceDto) {
    // 1️⃣ tạo hóa đơn
    const invoice = new this.invoiceModel({
      invoiceNumber: data.invoiceNumber,
      supplier: data.supplier,
      note: data.note,
      totalAmount: 0,
    });
    await invoice.save();

    let totalAmount = 0;

    // 2️⃣ tạo inventory + update stock
    for (const item of data.items) {
      const book = await this.bookModel.findById(item.book);
      if (!book) throw new NotFoundException(`Book not found: ${item.book}`);

      const variant = (
        book.variants as (BookVariant & { _id: Types.ObjectId })[]
      ).find((v) => v._id.toString() === item.variant);
      if (!variant)
        throw new NotFoundException(`Variant not found: ${item.variant}`);

      variant.stock = (variant.stock || 0) + item.quantity;
      await book.save();

      const totalPrice = item.quantity * item.unitPrice;
      totalAmount += totalPrice;

      const inventory = new this.inventoryModel({
        ...item,
        totalPrice,
        purchaseInvoice: invoice._id,
      });
      await inventory.save();
    }

    // 3️⃣ cập nhật tổng tiền
    invoice.totalAmount = totalAmount;
    await invoice.save();

    const inventories = await this.inventoryModel.find({
      purchaseInvoice: invoice._id,
    });
    return { invoice, inventories };
  }
}
