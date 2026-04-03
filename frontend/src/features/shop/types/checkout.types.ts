import type { CartLineItem } from '@/features/shop/types/cart-page.types';

export type CheckoutStepKey = 'shipping' | 'payment' | 'review';

export type ShippingMethodId = 'standard' | 'express';

export type PaymentMethodId = 'vnpay-qr' | 'momo' | 'zalopay' | 'card' | 'cod';

export type CheckoutPaymentMethodOption = {
  id: PaymentMethodId;
  label: string;
  description: string;
  shortLabel: string;
};

export type CheckoutShippingOption = {
  id: ShippingMethodId;
  label: string;
  description: string;
  fee: number;
};

export type CheckoutFormValues = {
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  district: string;
  shippingMethod: ShippingMethodId;
  paymentMethod: PaymentMethodId;
  cardNumber: string;
  expiry: string;
  cvc: string;
  promoCode: string;
  notes: string;
};

export type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  district: string;
};

export type CheckoutDraft = {
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethodId;
  paymentMethod: PaymentMethodId;
  cardLast4: string | null;
  promoCode: string | null;
  notes: string;
  updatedAt: number;
};

export type CheckoutPricingBreakdown = {
  subtotal: number;
  discount: number;
  shipping: number;
  estimatedTax: number;
  total: number;
};

export type CheckoutReviewData = {
  items: CartLineItem[];
  shippingAddress: ShippingAddress;
  shippingMethod: CheckoutShippingOption;
  paymentMethod: CheckoutPaymentMethodOption;
  pricing: CheckoutPricingBreakdown;
  promoCode: string | null;
  notes: string;
};

export type CheckoutConfirmationData = {
  orderId: string;
  createdAt: string;
  status: 'confirmed';
  review: CheckoutReviewData;
};

export type CheckoutOrderSummaryCardProps = {
  items: CartLineItem[];
  pricing: CheckoutPricingBreakdown;
  actionLabel: string;
  actionType?: 'button' | 'submit';
  actionForm?: string;
  onAction?: () => void;
  isActionLoading?: boolean;
  disabled?: boolean;
  promoCode?: string;
  promoInputValue?: string;
  onPromoInputChange?: (value: string) => void;
  onApplyPromo?: () => void;
  onClearPromo?: () => void;
  legalText?: string;
  sticky?: boolean;
};

export type CheckoutStepperProps = {
  currentStep: CheckoutStepKey;
};
