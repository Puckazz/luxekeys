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
    fullName: dto.full_name,
    email: dto.email,
    phone: dto.phone,
    joinedAt: dto.joined_at,
    role: dto.role,
  };
};

export const mapAddressDtoToModel = (dto: SavedAddressDto): SavedAddress => {
  return {
    id: dto.id,
    label: dto.label,
    fullName: dto.full_name,
    phone: dto.phone,
    streetAddress: dto.street_address,
    city: dto.city,
    district: dto.district,
    isDefault: dto.is_default,
    createdAt: dto.created_at,
  };
};

const mapOrderLineItemDtoToModel = (dto: OrderLineItemDto): OrderLineItem => {
  return {
    id: dto.id,
    name: dto.name,
    image: dto.image,
    variantLabel: dto.variant_label,
    quantity: dto.quantity,
    unitPrice: dto.unit_price,
  };
};

export const mapOrderDetailDtoToModel = (dto: OrderDetailDto): OrderDetail => {
  return {
    orderId: dto.order_id,
    createdAt: dto.created_at,
    status: dto.status,
    total: dto.total,
    itemCount: dto.item_count,
    paymentMethodLabel: dto.payment_method_label,
    shippingAddress: mapAddressDtoToModel(dto.shipping_address),
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
