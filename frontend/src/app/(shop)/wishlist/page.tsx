import type { Metadata } from 'next';

import { WishlistPage } from '@/features/shop/components/pages';

export const metadata: Metadata = {
  title: 'Wishlist | LuxeKeys',
  description: 'Browse and manage your saved products.',
};

export default function WishlistRoutePage() {
  return <WishlistPage />;
}
