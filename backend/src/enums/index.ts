export type Granularity = 'year' | 'quarter' | 'month' | 'week';

export const COMPLETED_ORDER_STATUSES = [
  'paid',
  'shipped',
  'completed',
] as const;
export type CompletedOrderStatus = (typeof COMPLETED_ORDER_STATUSES)[number];
