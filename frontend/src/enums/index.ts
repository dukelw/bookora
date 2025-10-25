export enum CartItemStatus {
  PENDING = "pending", // chưa mua
  PURCHASED = "purchased", // đã đánh dấu để mua
}

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  SHIPPED = "shipped",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

export enum RatingStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  UNKNOWN = "unknown",
}

export enum UserRole {
  ADMIN = "admin",
  CUSTOMER = "customer",
  UNKNOWN = "unknown",  
}
