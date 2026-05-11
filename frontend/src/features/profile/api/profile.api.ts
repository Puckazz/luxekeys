import { authFetch } from '@/shared/api/http-client';
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
import type {
  OrderDetail,
  OrderSummary,
  ProfileUser,
  SavedAddress,
} from '@/features/profile/types';
import type {
  OrderDetailDto,
  ProfileUserDto,
  SavedAddressDto,
} from '@/features/profile/types/profile-api.types';

type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const profileApi = {
  getProfile: async (): Promise<ProfileUser> => {
    const data = await authFetch<ProfileUserDto>('/users/me');
    return mapProfileDtoToModel(data);
  },

  updateProfile: async (
    payload: ProfileUpdatePayload
  ): Promise<ProfileUser> => {
    const data = await authFetch<ProfileUserDto>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({
        fullName: payload.fullName,
      }),
    });
    return mapProfileDtoToModel(data);
  },

  getAddresses: async (): Promise<SavedAddress[]> => {
    const data = await authFetch<SavedAddressDto[]>('/addresses');
    return data.map(mapAddressDtoToModel);
  },

  upsertAddress: async (
    payload: AddressUpsertPayload
  ): Promise<SavedAddress[]> => {
    if (payload.id) {
      await authFetch(`/addresses/${payload.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: payload.fullName,
          phone: payload.phone,
          streetAddress: payload.streetAddress,
          country: payload.country,
          province: payload.province,
          city: payload.city,
          isDefault: payload.isDefault,
        }),
      });
    } else {
      await authFetch('/addresses', {
        method: 'POST',
        body: JSON.stringify({
          fullName: payload.fullName,
          phone: payload.phone,
          streetAddress: payload.streetAddress,
          country: payload.country,
          province: payload.province,
          city: payload.city,
          isDefault: payload.isDefault,
        }),
      });
    }
    
    return profileApi.getAddresses();
  },

  removeAddress: async (addressId: string): Promise<SavedAddress[]> => {
    await authFetch(`/addresses/${addressId}`, {
      method: 'DELETE',
    });
    return profileApi.getAddresses();
  },

  setDefaultAddress: async (addressId: string): Promise<SavedAddress[]> => {
    await authFetch(`/addresses/${addressId}/set-default`, {
      method: 'PATCH',
    });
    return profileApi.getAddresses();
  },

  getOrders: async (
    status: OrdersFilterValue = 'all'
  ): Promise<OrderSummary[]> => {
    const query = new URLSearchParams();
    if (status !== 'all') {
      query.append('status', status);
    }
    
    const response = await authFetch<PaginatedResponse<OrderDetailDto>>(
      `/orders?${query.toString()}`
    );
    
    return response.data.map(mapOrderDetailDtoToModel).map(mapOrderDetailToSummary);
  },

  getOrderDetail: async (orderId: string): Promise<OrderDetail> => {
    const data = await authFetch<OrderDetailDto>(`/orders/${orderId}`);
    return mapOrderDetailDtoToModel(data);
  },
};
