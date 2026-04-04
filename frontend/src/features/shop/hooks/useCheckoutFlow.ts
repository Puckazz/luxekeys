'use client';

import { useMutation } from '@tanstack/react-query';

import {
  checkoutApi,
  checkoutPaymentOptions,
  checkoutShippingOptions,
} from '@/api/checkout.api';
import { useCartStore } from '@/features/shop/hooks/useCartStore';
import { useCheckoutStore } from '@/features/shop/hooks/useCheckoutStore';
import type {
  CheckoutDraft,
  CheckoutFormValues,
} from '@/features/shop/types/checkout.types';

const toCheckoutDraft = (values: CheckoutFormValues): CheckoutDraft => {
  return {
    shippingAddress: {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      streetAddress: values.streetAddress,
      city: values.city,
      district: values.district,
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
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);

  const draft = useCheckoutStore((state) => state.draft);
  const review = useCheckoutStore((state) => state.review);
  const setDraft = useCheckoutStore((state) => state.setDraft);
  const setReview = useCheckoutStore((state) => state.setReview);
  const setConfirmation = useCheckoutStore((state) => state.setConfirmation);

  const previewMutation = useMutation({
    mutationFn: checkoutApi.previewCheckout,
    onSuccess: (reviewData, variables) => {
      setDraft(variables.draft);
      setReview(reviewData);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: checkoutApi.confirmCheckout,
    onSuccess: (confirmation) => {
      setConfirmation(confirmation);
      clearCart();
    },
  });

  const submitCheckout = async (values: CheckoutFormValues) => {
    const draftData = toCheckoutDraft(values);

    await previewMutation.mutateAsync({
      items,
      draft: draftData,
    });
  };

  const confirmCheckout = async () => {
    if (!review) {
      throw new Error('No review data found.');
    }

    return confirmMutation.mutateAsync({
      review,
    });
  };

  return {
    draft,
    review,
    shippingOptions: checkoutShippingOptions,
    paymentOptions: checkoutPaymentOptions,
    isSubmittingCheckout: previewMutation.isPending,
    checkoutSubmitError: previewMutation.error,
    isConfirmingCheckout: confirmMutation.isPending,
    checkoutConfirmError: confirmMutation.error,
    submitCheckout,
    confirmCheckout,
  };
};
