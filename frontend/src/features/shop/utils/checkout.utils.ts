import type { CartLineItem } from '@/features/shop/types/cart-page.types';
import type { CheckoutPricingBreakdown } from '@/features/shop/types/checkout.types';
import { formatCurrency as formatSharedCurrency } from '@/lib/formatters';

export const CHECKOUT_ESTIMATED_TAX_RATE = 0.036;

export const calculateSubtotal = (items: CartLineItem[]): number => {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
};

export const normalizePromoCode = (promoCode: string | null | undefined) => {
  const normalized = promoCode?.trim().toUpperCase() ?? '';
  return normalized.length > 0 ? normalized : null;
};

export const resolveDiscountRate = (promoCode: string | null): number => {
  if (promoCode === 'SUMMER24') {
    return 0.1;
  }

  return 0;
};

export const buildOrderPricing = ({
  subtotal,
  shippingFee,
  discountRate,
  taxRate = CHECKOUT_ESTIMATED_TAX_RATE,
}: {
  subtotal: number;
  shippingFee: number;
  discountRate: number;
  taxRate?: number;
}): CheckoutPricingBreakdown => {
  const discount = subtotal * discountRate;
  const estimatedTax = subtotal * taxRate;
  const total = subtotal - discount + shippingFee + estimatedTax;

  return {
    subtotal,
    discount,
    shipping: shippingFee,
    estimatedTax,
    total,
  };
};

export const formatCurrency = (value: number): string => {
  return formatSharedCurrency(value, {
    minimumFractionDigits: 2,
  });
};
