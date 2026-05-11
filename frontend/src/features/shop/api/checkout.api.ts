import { authFetch } from '@/shared/api/http-client';
import type {
  CheckoutConfirmationData,
  CheckoutFormValues,
  CheckoutPaymentMethodOption,
  CheckoutShippingOption,
  PaymentMethodId,
} from '@/features/shop/types/checkout.types';
import type { OrderResponseDto } from '@/features/shop/types/checkout-api.types';
import { mapOrderResponseToConfirmation } from '@/features/shop/mappers/checkout.mapper';

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
    id: 'paypal',
    label: 'PayPal',
    description: 'Secure online payment',
    shortLabel: 'PP',
    disabled: true,
  },
  {
    id: 'momo',
    label: 'MoMo Wallet',
    description: 'Instant mobile payment',
    shortLabel: 'MO',
    disabled: true,
  },
  {
    id: 'card',
    label: 'Credit Card',
    description: 'Visa, Mastercard, JCB',
    shortLabel: 'CC',
    disabled: true,
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when you receive',
    shortLabel: 'COD',
  },
];

const toApiPaymentMethod = (method: PaymentMethodId): 'COD' | 'PAYPAL' => {
  return method === 'paypal' ? 'PAYPAL' : 'COD';
};

export const checkoutApi = {
  createOrder: async ({
    addressId,
    values,
  }: {
    addressId: string;
    values: CheckoutFormValues;
  }): Promise<CheckoutConfirmationData> => {
    const order = await authFetch<OrderResponseDto>('/orders', {
      method: 'POST',
      body: JSON.stringify({
        addressId,
        paymentMethod: toApiPaymentMethod(values.paymentMethod),
        note: values.notes.trim() || undefined,
      }),
    });

    return mapOrderResponseToConfirmation({
      order,
      values,
      shippingOptions: checkoutShippingOptions,
      paymentOptions: checkoutPaymentOptions,
    });
  },
};
