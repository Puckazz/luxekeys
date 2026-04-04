import type { Metadata } from 'next';

import { CheckoutPage } from '@/features/shop/components/pages';

export const metadata: Metadata = {
  title: 'Checkout | LuxeKeys',
  description: 'Provide shipping and payment details to continue checkout.',
};

export default function CheckoutRoutePage() {
  return <CheckoutPage />;
}
