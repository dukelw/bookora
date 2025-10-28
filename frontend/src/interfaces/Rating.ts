export default interface Rating {
  _id: string;
  book: string;
  user: {
    name: string;
    avatar: string;
    _id: string;
    fullname: string;
  };
  variant: {
    rarity: string;
    price: number;
  },
  stars: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}
