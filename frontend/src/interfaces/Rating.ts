export interface Rating {
  _id: string;
  book: string;
  user: {
    _id: string;
    fullname: string;
  };
  stars: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}
