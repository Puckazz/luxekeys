import type { OrderStatus } from '@/features/profile/types';

export type OrdersFilterValue = 'all' | OrderStatus;

export type OrdersQueryState = {
  status: OrdersFilterValue;
};
