import type { Metadata } from 'next';

import CheckoutReviewPage from '@/features/shop/components/CheckoutReviewPage';

export const metadata: Metadata = {
  title: 'Review Checkout | LuxeKeys',
  description:
    'Review shipping, payment details, and order summary before confirming.',
};

export default function CheckoutReviewRoutePage() {
  return <CheckoutReviewPage />;
}
