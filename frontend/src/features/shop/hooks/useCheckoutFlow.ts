'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  checkoutApi,
  checkoutPaymentOptions,
  checkoutShippingOptions,
} from '@/features/shop/api/checkout.api';
import { useCheckoutStore } from '@/stores/shop/checkout.store';
import type {
  CheckoutDraft,
  CheckoutFormValues,
} from '@/features/shop/types/checkout.types';
import { useCartStore } from '@/stores/shop/cart.store';

const toCheckoutDraft = (values: CheckoutFormValues): CheckoutDraft => {
  return {
    shippingAddress: {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      streetAddress: values.streetAddress,
      country: values.country,
      province: values.province,
      city: values.city,
    },
    shippingMethod: values.shippingMethod,
    paymentMethod: values.paymentMethod,
    cardLast4:
      values.paymentMethod === 'card'
        ? values.cardNumber.replace(/\D+/g, '').slice(-4)
        : null,
    promoCode: values.promoCode.trim() || null,
    notes: values.notes.trim(),
    updatedAt: Date.now(),
  };
};

export const useCheckoutFlow = () => {
  const queryClient = useQueryClient();
  const resetCart = useCartStore((state) => state.reset);

  const draft = useCheckoutStore((state) => state.draft);
  const setDraft = useCheckoutStore((state) => state.setDraft);
  const setConfirmation = useCheckoutStore((state) => state.setConfirmation);

  const createOrderMutation = useMutation({
    mutationFn: checkoutApi.createOrder,
    onSuccess: (confirmation) => {
      setConfirmation(confirmation);
      resetCart();
      queryClient.setQueryData(['cart'], {
        items: [],
        updatedAt: Date.now(),
      });
    },
  });

  const submitCheckout = async (
    values: CheckoutFormValues,
    addressId: string
  ) => {
    const draftData = toCheckoutDraft(values);

    setDraft(draftData);

    return createOrderMutation.mutateAsync({
      values,
      addressId,
    });
  };

  return {
    draft,
    shippingOptions: checkoutShippingOptions,
    paymentOptions: checkoutPaymentOptions,
    isSubmittingCheckout: createOrderMutation.isPending,
    checkoutSubmitError: createOrderMutation.error,
    submitCheckout,
  };
};
