import { User } from "next-auth";

export default interface Comment {
  _id: string;
  user: User;
  bookId: string;
  content: string;
  parentComment?: string | null;
  directParentComment?: Comment | null;
  createdAt: string;
  updatedAt: string;
}
