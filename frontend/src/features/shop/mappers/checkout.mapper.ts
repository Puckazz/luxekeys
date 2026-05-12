import type { CartLineItem } from '@/features/shop/types/cart-page.types';
import type {
  CheckoutConfirmationData,
  CheckoutFormValues,
  CheckoutPaymentMethodOption,
  CheckoutShippingOption,
} from '@/features/shop/types/checkout.types';
import type {
  OrderAddressSnapshotDto,
  OrderResponseDto,
} from '@/features/shop/types/checkout-api.types';

const resolvePaymentMethodId = (
  paymentMethod: OrderResponseDto['paymentMethod']
): CheckoutFormValues['paymentMethod'] => {
  return paymentMethod === 'PAYPAL' ? 'paypal' : 'cod';
};

const toShippingAddress = (
  values: CheckoutFormValues,
  address?: OrderAddressSnapshotDto | null
): CheckoutConfirmationData['review']['shippingAddress'] => {
  return {
    fullName: address?.fullName ?? values.fullName,
    email: values.email,
    phone: address?.phone ?? values.phone,
    streetAddress: address?.streetAddress ?? values.streetAddress,
    country: address?.country ?? values.country,
    province: address?.province ?? values.province,
    city: address?.city ?? values.city,
  };
};

const toCartLineItems = (items: OrderResponseDto['items']): CartLineItem[] => {
  return items.map((item) => ({
    id: item.id,
    variantId: item.variantId ?? item.productId,
    switchOptionId: item.switchOptionId ?? null,
    slug: '',
    name: item.productName,
    variantLabel: item.variantName ?? 'Standard',
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    image: item.thumbnailUrl ?? '',
  }));
};

export const mapOrderResponseToConfirmation = ({
  order,
  values,
  shippingOptions,
  paymentOptions,
}: {
  order: OrderResponseDto;
  values: CheckoutFormValues;
  shippingOptions: CheckoutShippingOption[];
  paymentOptions: CheckoutPaymentMethodOption[];
}): CheckoutConfirmationData => {
  const paymentId = resolvePaymentMethodId(order.paymentMethod);
  const paymentMethod =
    paymentOptions.find((option) => option.id === paymentId) ??
    paymentOptions[0];
  const shippingMethod =
    shippingOptions.find((option) => option.id === values.shippingMethod) ??
    shippingOptions[0];
  const promoCode = values.promoCode.trim() || null;

  return {
    orderId: order.orderCode,
    createdAt: order.placedAt,
    status: 'confirmed',
    review: {
      items: toCartLineItems(order.items),
      shippingAddress: toShippingAddress(values, order.address),
      shippingMethod,
      paymentMethod,
      pricing: {
        subtotal: order.subtotalAmount,
        discount: order.discountAmount,
        shipping: order.shippingAmount,
        estimatedTax: 0,
        total: order.totalAmount,
      },
      promoCode,
      notes: values.notes.trim(),
    },
  };
};
