import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { Order } from 'src/schemas/order.schema';
import {
  LoyaltyTransaction,
  LoyaltyTransactionDocument,
  LoyaltyTxType,
} from 'src/schemas/loyalty-transaction.schema';
import { EARN_RATE, VND_PER_POINT } from 'src/constant';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(LoyaltyTransaction.name)
    private readonly txModel: Model<LoyaltyTransactionDocument>,
  ) {}

  async getBalance(userId: string | Types.ObjectId) {
    const uid = new Types.ObjectId(userId as any);
    const u = await this.userModel.findById(uid).select('loyaltyPoints').lean();
    const points = u?.loyaltyPoints || 0;
    return {
      points,
      vndPerPoint: VND_PER_POINT,
      vndValue: points * VND_PER_POINT,
    };
  }

  // Cộng điểm khi đơn PAID/SHIPPED lần đầu
  async earn(
    userId: Types.ObjectId,
    orderId: Types.ObjectId,
    finalAmountVnd: number,
  ): Promise<number> {
    const points = Math.floor(
      (Math.max(0, finalAmountVnd) * EARN_RATE) / VND_PER_POINT,
    );
    if (points <= 0) return 0;

    await this.userModel
      .updateOne({ _id: userId }, { $inc: { loyaltyPoints: points } })
      .exec();
    await this.txModel.create({
      user: userId,
      order: orderId,
      type: LoyaltyTxType.EARN,
      points,
      amountVnd: finalAmountVnd,
      note: 'Earn on paid/shipped order',
    });

    return points;
  }

  // Trừ điểm khi tạo đơn
  async redeem(
    userId: Types.ObjectId,
    orderId: Types.ObjectId | null,
    points: number,
  ): Promise<number> {
    const want = Math.max(0, Number(points || 0));
    if (want <= 0) return 0;

    const u = await this.userModel.findById(userId).select('loyaltyPoints');
    if (!u) throw new BadRequestException('User not found');

    const usable = Math.min(want, u.loyaltyPoints);
    if (usable <= 0) return 0;

    await this.userModel
      .updateOne({ _id: userId }, { $inc: { loyaltyPoints: -usable } })
      .exec();
    await this.txModel.create({
      user: userId,
      order: orderId || undefined,
      type: LoyaltyTxType.REDEEM,
      points: usable,
      amountVnd: usable * VND_PER_POINT,
      note: 'Redeem at checkout',
    });

    return usable;
  }

  // Hoàn điểm khi hủy đơn trước khi PAID/SHIPPED
  async refund(
    userId: Types.ObjectId,
    orderId: Types.ObjectId,
    points: number,
  ): Promise<number> {
    const p = Math.max(0, Number(points || 0));
    if (p <= 0) return 0;

    await this.userModel
      .updateOne({ _id: userId }, { $inc: { loyaltyPoints: p } })
      .exec();
    await this.txModel.create({
      user: userId,
      order: orderId,
      type: LoyaltyTxType.REFUND,
      points: p,
      amountVnd: p * VND_PER_POINT,
      note: 'Refund on cancellation before paid/shipped',
    });

    return p;
  }

  async history(
    userId: string | Types.ObjectId,
    q: { type?: 'earn' | 'redeem' | 'refund'; page?: number; limit?: number },
  ) {
    const uid = new Types.ObjectId(userId as any);
    const page = Math.max(1, Number(q.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(q.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = { user: uid };
    if (q.type) filter.type = q.type;

    const [items, total] = await Promise.all([
      this.txModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.txModel.countDocuments(filter),
    ]);

    return { items, meta: { page, limit, total } };
  }
}
