import type {
  AdminOrder,
  AdminOrderDetail,
  AdminOrderListApiResponse,
  AdminOrderListQueryState,
  AdminOrderStatusSummary,
  BulkUpdateAdminOrderStatusInput,
  BulkUpdateAdminOrderStatusResponse,
  UpdateAdminOrderStatusInput,
} from '@/features/admin/types/admin-orders.types';
import { createSeedOrders } from '@/api/mocks/admin-orders.mock';

const MOCK_NETWORK_DELAY = 160;

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let ordersStore: AdminOrderDetail[] = createSeedOrders();

const normalizeSearchTerm = (value: string) => {
  return value.trim().toLowerCase();
};

const filterBySearch = (orders: AdminOrderDetail[], search: string) => {
  const normalizedSearch = normalizeSearchTerm(search);

  if (!normalizedSearch) {
    return orders;
  }

  return orders.filter((order) => {
    return (
      normalizeSearchTerm(order.id).includes(normalizedSearch) ||
      normalizeSearchTerm(order.customer.name).includes(normalizedSearch) ||
      normalizeSearchTerm(order.customer.email).includes(normalizedSearch) ||
      normalizeSearchTerm(order.paymentMethodLabel).includes(normalizedSearch)
    );
  });
};

const filterByStatus = (
  orders: AdminOrderDetail[],
  status: AdminOrderListQueryState['status']
) => {
  if (status === 'all') {
    return orders;
  }

  return orders.filter((order) => order.status === status);
};

const sortOrders = (
  orders: AdminOrderDetail[],
  sort: AdminOrderListQueryState['sort']
) => {
  const next = [...orders];

  if (sort === 'oldest') {
    next.sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
    );
    return next;
  }

  if (sort === 'amount-desc') {
    next.sort((left, right) => right.total - left.total);
    return next;
  }

  if (sort === 'amount-asc') {
    next.sort((left, right) => left.total - right.total);
    return next;
  }

  if (sort === 'customer-asc') {
    next.sort((left, right) =>
      left.customer.name.localeCompare(right.customer.name)
    );
    return next;
  }

  if (sort === 'status-asc') {
    next.sort((left, right) => left.status.localeCompare(right.status));
    return next;
  }

  next.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

  return next;
};

const paginate = (
  orders: AdminOrderDetail[],
  page: number,
  pageSize: number
): Pick<AdminOrderListApiResponse, 'items' | 'meta'> => {
  const totalItems = orders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: orders.slice(start, end).map(toOrderListItem),
    meta: {
      page: currentPage,
      pageSize,
      totalItems,
      totalPages,
    },
  };
};

const buildStatusSummary = (
  orders: AdminOrderDetail[]
): AdminOrderStatusSummary => {
  const initialSummary: AdminOrderStatusSummary = {
    all: orders.length,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  return orders.reduce((summary, order) => {
    summary[order.status] += 1;
    return summary;
  }, initialSummary);
};

const toOrderListItem = (order: AdminOrderDetail): AdminOrder => {
  return {
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    total: order.total,
    itemCount: order.itemCount,
    paymentMethodLabel: order.paymentMethodLabel,
    customer: order.customer,
    shippingAddress: order.shippingAddress,
  };
};

export const adminOrdersApi = {
  getOrders: async (
    queryState: AdminOrderListQueryState
  ): Promise<AdminOrderListApiResponse> => {
    await delay(MOCK_NETWORK_DELAY);

    const withSearch = filterBySearch(ordersStore, queryState.search);
    const summary = buildStatusSummary(withSearch);
    const withStatus = filterByStatus(withSearch, queryState.status);
    const sorted = sortOrders(withStatus, queryState.sort);
    const paginated = paginate(sorted, queryState.page, queryState.pageSize);

    return {
      ...paginated,
      summary,
    };
  },

  getOrderDetail: async (orderId: string): Promise<AdminOrderDetail> => {
    await delay(MOCK_NETWORK_DELAY);

    const order = ordersStore.find((item) => item.id === orderId);

    if (!order) {
      throw new Error('Order not found.');
    }

    return order;
  },

  updateOrderStatus: async (
    input: UpdateAdminOrderStatusInput
  ): Promise<AdminOrder> => {
    await delay(MOCK_NETWORK_DELAY);

    const order = ordersStore.find((item) => item.id === input.orderId);

    if (!order) {
      throw new Error('Order not found.');
    }

    order.status = input.status;

    return toOrderListItem(order);
  },

  bulkUpdateOrderStatus: async (
    input: BulkUpdateAdminOrderStatusInput
  ): Promise<BulkUpdateAdminOrderStatusResponse> => {
    await delay(MOCK_NETWORK_DELAY);

    const targetOrderIds = new Set(input.orderIds);

    let updatedCount = 0;

    ordersStore = ordersStore.map((order) => {
      if (!targetOrderIds.has(order.id)) {
        return order;
      }

      updatedCount += 1;

      return {
        ...order,
        status: input.status,
      };
    });

    return {
      updatedCount,
    };
  },
};
