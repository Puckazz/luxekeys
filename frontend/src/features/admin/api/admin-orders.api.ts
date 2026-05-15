import type {
  AdminOrder,
  AdminOrderDetail,
  AdminOrderListApiResponse,
  BulkUpdateAdminOrderStatusInput,
  BulkUpdateAdminOrderStatusResponse,
  UpdateAdminOrderInput,
  UpdateAdminOrderStatusInput,
} from '@/features/admin/types/admin-orders.types';
import type {
  AdminOrderApiDetail,
  AdminOrderListApiData,
  AdminOrderListQueryState,
  AdminPaginationApiMeta,
} from '@/features/admin/types/admin-orders.types';
import {
  mapApiOrderToAdminOrder,
  mapApiOrderToAdminOrderDetail,
  mapApiSummaryToAdminSummary,
  mapPaginationMeta,
  orderSortToApiParams,
  orderStatusFilterToApiStatus,
  paymentStatusToApiPaymentStatus,
  toQueryString,
} from '@/features/admin/mappers';
import { authFetch, authFetchWithMeta } from '@/shared/api/http-client';

export const adminOrdersApi = {
  getOrders: async (
    queryState: AdminOrderListQueryState
  ): Promise<AdminOrderListApiResponse> => {
    const sort = orderSortToApiParams(queryState.sort);
    const query = toQueryString({
      search: queryState.search,
      status: orderStatusFilterToApiStatus(queryState.status),
      page: queryState.page,
      limit: queryState.pageSize,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
    });
    const response = await authFetchWithMeta<
      AdminOrderListApiData,
      AdminPaginationApiMeta
    >(`/admin/orders?${query}`);

    return {
      items: response.data.items.map(mapApiOrderToAdminOrder),
      meta: mapPaginationMeta(
        response.meta,
        queryState.page,
        queryState.pageSize
      ),
      summary: mapApiSummaryToAdminSummary(response.data.summary),
    };
  },

  getOrderDetail: async (orderId: string): Promise<AdminOrderDetail> => {
    const order = await authFetch<AdminOrderApiDetail>(`/admin/orders/${orderId}`);
    return mapApiOrderToAdminOrderDetail(order);
  },

  updateOrder: async (
    input: UpdateAdminOrderInput
  ): Promise<AdminOrderDetail> => {
    const order = await authFetch<AdminOrderApiDetail>(
      `/admin/orders/${input.orderId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          ...(input.status !== undefined && {
            status: orderStatusFilterToApiStatus(input.status),
          }),
          ...(input.paymentStatus !== undefined && {
            paymentStatus: paymentStatusToApiPaymentStatus(input.paymentStatus),
          }),
          ...(input.trackingCode !== undefined && {
            trackingCode: input.trackingCode,
          }),
        }),
      }
    );

    return mapApiOrderToAdminOrderDetail(order);
  },

  updateOrderStatus: async (
    input: UpdateAdminOrderStatusInput
  ): Promise<AdminOrder> => {
    const order = await adminOrdersApi.updateOrder(input);

    return order;
  },

  bulkUpdateOrderStatus: async (
    input: BulkUpdateAdminOrderStatusInput
  ): Promise<BulkUpdateAdminOrderStatusResponse> => {
    return authFetch<BulkUpdateAdminOrderStatusResponse>(
      '/admin/orders/bulk-status',
      {
        method: 'PATCH',
        body: JSON.stringify({
          orderIds: input.orderIds,
          status: orderStatusFilterToApiStatus(input.status),
        }),
      }
    );
  },
};
