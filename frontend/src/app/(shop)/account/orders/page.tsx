import type { Metadata } from 'next';

import { OrdersPage } from '@/features/profile/components/pages';

export const metadata: Metadata = {
  title: 'Order History | LuxeKeys',
  description: 'Track your recent and past orders.',
};

export default function OrdersRoutePage() {
  return <OrdersPage />;
}
