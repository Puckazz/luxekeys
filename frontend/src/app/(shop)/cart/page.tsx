import type { Metadata } from 'next';

import { CartPage } from '@/features/shop/components/pages';

export const metadata: Metadata = {
  title: 'Shopping Cart | LuxeKeys',
  description: 'Review selected items and proceed to checkout.',
};

export default function CartRoutePage() {
  return <CartPage />;
}
