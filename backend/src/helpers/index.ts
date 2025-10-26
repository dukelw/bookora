import mongoose from 'mongoose';
import { Types } from 'mongoose';

export function buildCategoryInList(category: string) {
  const idStr = String(category).trim();
  const inList: any[] = [idStr];
  if (mongoose.Types.ObjectId.isValid(idStr)) {
    inList.push(new Types.ObjectId(idStr));
  }
  return inList;
}
