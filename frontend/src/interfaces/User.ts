export default interface User {
  _id: string;
  id: number;
  email: string;
  name?: string;
  avatar?: string;
  gender?: string;
  shippingAddress: string;
  addresses: string[];
  address: string;
  password: string;
  phone?: string;
  createdAt: string; // Date in ISO string format
  updatedAt: string; // Date in ISO string format
  isActive: boolean;
}
