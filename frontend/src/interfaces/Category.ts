export default interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  ageRange?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}
