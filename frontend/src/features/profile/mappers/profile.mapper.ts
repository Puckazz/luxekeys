import type {
  OrderDetail,
  OrderLineItem,
  OrderSummary,
  ProfileUser,
  SavedAddress,
} from '@/features/profile/types';
import type {
  OrderDetailDto,
  OrderLineItemDto,
  ProfileUserDto,
  SavedAddressDto,
} from '@/features/profile/types/profile-api.types';

export const mapProfileDtoToModel = (dto: ProfileUserDto): ProfileUser => {
  return {
    id: dto.id,
    fullName: dto.fullName,
    email: dto.email,
    phone: dto.phone,
    avatarUrl: dto.avatarUrl,
    joinedAt: dto.createdAt,
    role: dto.role,
  };
};

export const mapAddressDtoToModel = (dto: SavedAddressDto): SavedAddress => {
  return {
    id: dto.id,
    label: 'Home', // Label is no longer in backend, default to Home
    fullName: dto.fullName,
    phone: dto.phone,
    streetAddress: dto.streetAddress,
    country: dto.country ?? 'Vietnam',
    province: dto.province,
    city: dto.city,
    isDefault: dto.isDefault,
    createdAt: dto.createdAt,
  };
};

const createFallbackAddress = (): SavedAddress => {
  return {
    id: 'unknown-address',
    label: 'Home',
    fullName: 'Unavailable',
    phone: '',
    streetAddress: 'Address unavailable',
    country: 'Vietnam',
    province: '',
    city: '',
    isDefault: false,
    createdAt: new Date(0).toISOString(),
  };
};

const mapOrderLineItemDtoToModel = (dto: OrderLineItemDto): OrderLineItem => {
  const variantLabel = dto.switchOptionName
    ? `${dto.variantName ?? 'Standard'} / ${dto.switchOptionName}`
    : dto.variantName ?? 'Standard';

  return {
    id: dto.id,
    productId: dto.productId,
    switchOptionName: dto.switchOptionName,
    name: dto.productName,
    image: dto.thumbnailUrl ?? '',
    variantLabel,
    quantity: dto.quantity,
    unitPrice: dto.unitPrice,
    isReviewed: dto.isReviewed,
    review: dto.review,
  };
};

const getPaymentMethodLabel = (method: string): string => {
  const map: Record<string, string> = {
    COD: 'Cash on Delivery',
    PAYPAL: 'PayPal',
  };
  return map[method] || method;
};

const mapOrderStatusDtoToModel = (
  status: OrderDetailDto['status']
): OrderDetail['status'] => {
  switch (status) {
    case 'PENDING':
      return 'pending';
    case 'CONFIRMED':
      return 'confirmed';
    case 'SHIPPING':
      return 'shipped';
    case 'DELIVERED':
      return 'delivered';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'pending';
  }
};

export const mapOrderDetailDtoToModel = (dto: OrderDetailDto): OrderDetail => {
  return {
    orderId: dto.id,
    orderCode: dto.orderCode,
    createdAt: dto.placedAt,
    status: mapOrderStatusDtoToModel(dto.status),
    total: dto.totalAmount,
    itemCount: dto.items.reduce((sum, item) => sum + item.quantity, 0),
    paymentMethodLabel: getPaymentMethodLabel(dto.paymentMethod),
    shippingAddress: dto.address
      ? mapAddressDtoToModel(dto.address)
      : createFallbackAddress(),
    items: dto.items.map(mapOrderLineItemDtoToModel),
  };
};

export const mapOrderDetailToSummary = (order: OrderDetail): OrderSummary => {
  return {
    orderId: order.orderId,
    orderCode: order.orderCode,
    createdAt: order.createdAt,
    status: order.status,
    total: order.total,
    itemCount: order.itemCount,
  };
};
