import type { CartLineItem } from '@/features/shop/types/cart-page.types';
import type {
  CheckoutConfirmationData,
  CheckoutDraft,
  CheckoutPaymentMethodOption,
  CheckoutReviewData,
  CheckoutShippingOption,
} from '@/features/shop/types/checkout.types';
import {
  buildOrderPricing,
  calculateSubtotal,
  normalizePromoCode,
  resolveDiscountRate,
} from '@/features/shop/utils/checkout.utils';

const MOCK_DELAY = 220;

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const checkoutShippingOptions: CheckoutShippingOption[] = [
  {
    id: 'standard',
    label: 'Standard Delivery',
    description: '3-5 business days',
    fee: 0,
  },
  {
    id: 'express',
    label: 'Express Delivery',
    description: 'Next business day',
    fee: 18,
  },
];

export const checkoutPaymentOptions: CheckoutPaymentMethodOption[] = [
  {
    id: 'vnpay-qr',
    label: 'VNPay QR',
    description: 'Pay via banking app QR',
    shortLabel: 'VN',
  },
  {
    id: 'momo',
    label: 'MoMo Wallet',
    description: 'Instant mobile payment',
    shortLabel: 'MO',
  },
  {
    id: 'zalopay',
    label: 'ZaloPay',
    description: 'Safe and fast',
    shortLabel: 'ZA',
  },
  {
    id: 'card',
    label: 'Credit Card',
    description: 'Visa, Mastercard, JCB',
    shortLabel: 'CC',
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when you receive',
    shortLabel: 'COD',
  },
];

let orderCounter = 1024;

const cloneCartItems = (items: CartLineItem[]) => {
  return items.map((item) => ({ ...item }));
};

export const checkoutApi = {
  previewCheckout: async ({
    items,
    draft,
  }: {
    items: CartLineItem[];
    draft: CheckoutDraft;
  }): Promise<CheckoutReviewData> => {
    await delay(MOCK_DELAY);

    if (items.length === 0) {
      throw new Error('Your cart is empty.');
    }

    const shippingMethod = checkoutShippingOptions.find(
      (option) => option.id === draft.shippingMethod
    );
    const paymentMethod = checkoutPaymentOptions.find(
      (option) => option.id === draft.paymentMethod
    );

    if (!shippingMethod || !paymentMethod) {
      throw new Error('Invalid shipping or payment method.');
    }

    const subtotal = calculateSubtotal(items);
    const promoCode = normalizePromoCode(draft.promoCode);
    const discountRate = resolveDiscountRate(promoCode);
    const pricing = buildOrderPricing({
      subtotal,
      shippingFee: shippingMethod.fee,
      discountRate,
    });

    return {
      items: cloneCartItems(items),
      shippingAddress: { ...draft.shippingAddress },
      shippingMethod,
      paymentMethod,
      pricing,
      promoCode,
      notes: draft.notes,
    };
  },

  confirmCheckout: async ({
    review,
  }: {
    review: CheckoutReviewData;
  }): Promise<CheckoutConfirmationData> => {
    await delay(MOCK_DELAY);

    orderCounter += 1;

    return {
      orderId: `LK-${orderCounter}`,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      review: {
        ...review,
        items: cloneCartItems(review.items),
      },
    };
  },
};
