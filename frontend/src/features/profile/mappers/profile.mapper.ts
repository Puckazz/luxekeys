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

const mapOrderLineItemDtoToModel = (dto: OrderLineItemDto): OrderLineItem => {
  return {
    id: dto.id,
    name: dto.productName,
    image: dto.thumbnailUrl,
    variantLabel: dto.variantName,
    quantity: dto.quantity,
    unitPrice: dto.unitPrice,
  };
};

const getPaymentMethodLabel = (method: string): string => {
  const map: Record<string, string> = {
    cod: 'Cash on Delivery',
    card: 'Credit Card',
    momo: 'MoMo',
    paypal: 'PayPal',
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
    createdAt: dto.placedAt,
    status: mapOrderStatusDtoToModel(dto.status),
    total: dto.totalAmount,
    itemCount: dto.items.reduce((sum, item) => sum + item.quantity, 0),
    paymentMethodLabel: getPaymentMethodLabel(dto.paymentMethod),
    shippingAddress: mapAddressDtoToModel(dto.address),
    items: dto.items.map(mapOrderLineItemDtoToModel),
  };
};

export const mapOrderDetailToSummary = (order: OrderDetail): OrderSummary => {
  return {
    orderId: order.orderId,
    createdAt: order.createdAt,
    status: order.status,
    total: order.total,
    itemCount: order.itemCount,
  };
};
