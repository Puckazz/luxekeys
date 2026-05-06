import type {
  AddressUpsertPayload,
  OrdersFilterValue,
  ProfileUpdatePayload,
} from '@/features/profile/types';
import {
  mapAddressDtoToModel,
  mapOrderDetailDtoToModel,
  mapOrderDetailToSummary,
  mapProfileDtoToModel,
} from '@/features/profile/mappers/profile.mapper';
import {
  addressesMock,
  orderDetailsMock,
  profileUserMock,
} from '@/features/profile/mocks/profile.data';
import type {
  OrderDetail,
  OrderSummary,
  ProfileUser,
  SavedAddress,
} from '@/features/profile/types';

const MOCK_DELAY = 180;

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let profileData = { ...profileUserMock };
let addressData = addressesMock.map((address) => ({ ...address }));
const orderData = orderDetailsMock.map((order) => ({ ...order }));

const normalizeAddresses = (addresses: SavedAddress[]): SavedAddress[] => {
  const hasDefault = addresses.some((address) => address.isDefault);

  if (hasDefault) {
    return addresses;
  }

  return addresses.map((address, index) => ({
    ...address,
    isDefault: index === 0,
  }));
};

const toAddressModelList = (): SavedAddress[] => {
  return normalizeAddresses(addressData.map(mapAddressDtoToModel));
};

const toOrderDetailModelList = (): OrderDetail[] => {
  return orderData.map(mapOrderDetailDtoToModel);
};

export const profileApi = {
  getProfile: async (): Promise<ProfileUser> => {
    await delay(MOCK_DELAY);
    return mapProfileDtoToModel(profileData);
  },

  updateProfile: async (
    payload: ProfileUpdatePayload
  ): Promise<ProfileUser> => {
    await delay(MOCK_DELAY);

    profileData = {
      ...profileData,
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone,
    };

    return mapProfileDtoToModel(profileData);
  },

  getAddresses: async (): Promise<SavedAddress[]> => {
    await delay(MOCK_DELAY);
    return toAddressModelList();
  },

  upsertAddress: async (
    payload: AddressUpsertPayload
  ): Promise<SavedAddress[]> => {
    await delay(MOCK_DELAY);

    const nextId = payload.id ?? `addr_${Date.now()}`;

    const nextAddress = {
      id: nextId,
      label: payload.label,
      full_name: payload.fullName,
      phone: payload.phone,
      street_address: payload.streetAddress,
      city: payload.city,
      district: payload.district,
      is_default: payload.isDefault,
      created_at: new Date().toISOString(),
    };

    addressData = addressData.filter((address) => address.id !== nextId);
    addressData.unshift(nextAddress);

    if (nextAddress.is_default) {
      addressData = addressData.map((address) => ({
        ...address,
        is_default: address.id === nextId,
      }));
    }

    return toAddressModelList();
  },

  removeAddress: async (addressId: string): Promise<SavedAddress[]> => {
    await delay(MOCK_DELAY);
    addressData = addressData.filter((address) => address.id !== addressId);
    return toAddressModelList();
  },

  setDefaultAddress: async (addressId: string): Promise<SavedAddress[]> => {
    await delay(MOCK_DELAY);

    addressData = addressData.map((address) => ({
      ...address,
      is_default: address.id === addressId,
    }));

    return toAddressModelList();
  },

  getOrders: async (
    status: OrdersFilterValue = 'all'
  ): Promise<OrderSummary[]> => {
    await delay(MOCK_DELAY);

    const details = toOrderDetailModelList();
    const filtered =
      status === 'all'
        ? details
        : details.filter((order) => order.status === status);

    return filtered.map(mapOrderDetailToSummary);
  },

  getOrderDetail: async (orderId: string): Promise<OrderDetail> => {
    await delay(MOCK_DELAY);

    const detail = toOrderDetailModelList().find(
      (order) => order.orderId === orderId
    );

    if (!detail) {
      throw new Error('Order not found.');
    }

    return detail;
  },
};
