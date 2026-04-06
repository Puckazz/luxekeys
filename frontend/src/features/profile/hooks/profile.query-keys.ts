export const PROFILE_QUERY_KEYS = {
  profile: ['profile', 'me'] as const,
  addresses: ['profile', 'addresses'] as const,
  orders: (status: string) => ['profile', 'orders', status] as const,
  orderDetail: (orderId: string) => ['profile', 'orders', orderId] as const,
};
