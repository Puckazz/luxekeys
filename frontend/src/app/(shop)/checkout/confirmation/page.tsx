import type { Metadata } from 'next';

import { CheckoutConfirmationPage } from '@/features/shop/components/pages';

export const metadata: Metadata = {
  title: 'Order Confirmation | LuxeKeys',
  description: 'Your checkout has been completed successfully.',
};

export default function CheckoutConfirmationRoutePage() {
  return <CheckoutConfirmationPage />;
}
