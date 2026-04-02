import { z } from 'zod';

const paymentMethodSchema = z.enum([
  'vnpay-qr',
  'momo',
  'zalopay',
  'card',
  'cod',
]);

const shippingMethodSchema = z.enum(['standard', 'express']);

export const checkoutSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required.'),
    email: z.email('Email is invalid.'),
    phone: z.string().regex(/^[0-9+()\s-]{8,18}$/, 'Phone number is invalid.'),
    streetAddress: z.string().min(6, 'Street address is required.'),
    city: z.string().min(2, 'Please select a city.'),
    district: z.string().min(2, 'Please select a district.'),
    shippingMethod: shippingMethodSchema,
    paymentMethod: paymentMethodSchema,
    cardNumber: z.string(),
    expiry: z.string(),
    cvc: z.string(),
    promoCode: z.string().max(24, 'Promo code is too long.'),
    notes: z.string().max(240, 'Delivery notes is too long.'),
  })
  .superRefine((values, context) => {
    const isCardPayment = values.paymentMethod === 'card';

    if (!isCardPayment) {
      return;
    }

    const normalizedCard = values.cardNumber.replace(/\s+/g, '');
    const normalizedCvc = values.cvc.replace(/\s+/g, '');

    if (!/^\d{13,19}$/.test(normalizedCard)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cardNumber'],
        message: 'Card number must contain 13-19 digits.',
      });
    }

    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(values.expiry)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expiry'],
        message: 'Expiry must be in MM/YY format.',
      });
    }

    if (!/^\d{3,4}$/.test(normalizedCvc)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cvc'],
        message: 'CVC must contain 3-4 digits.',
      });
    }
  });
