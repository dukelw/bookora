export default interface LoyaltyBalance {
  points: number; // tổng điểm hiện có
  vndPerPoint: number; // giá trị quy đổi 1 điểm sang VNĐ
  vndValue: number; // tổng giá trị VNĐ tương ứng (points * vndPerPoint)
}
