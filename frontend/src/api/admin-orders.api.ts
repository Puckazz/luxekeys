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
import type { OrderStatus } from '@/features/profile/types';

const MOCK_NETWORK_DELAY = 160;

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
];

const CUSTOMER_NAMES = [
  'Marvin McKinney',
  'Courtney Henry',
  'Floyd Miles',
  'Devon Lane',
  'Arlene McCoy',
  'Dianne Russell',
  'Albert Flores',
  'Ralph Edwards',
  'Savannah Nguyen',
  'Esther Howard',
  'Brooklyn Simmons',
  'Leslie Alexander',
];

const PAYMENT_METHODS = ['Credit Card', 'Master Card', 'Visa', 'VNPay QR'];

const ORDER_ITEM_CATALOG = [
  {
    name: 'Aether 75 Aluminum Keyboard',
    image: '/images/products/keyboards/keyboard-1.jpg',
    variantLabel: 'Navy, Gateron Oil King',
    unitPrice: 259,
  },
  {
    name: 'PBT Cherry Keycap Set - Glacier',
    image: '/images/products/keycaps/keycap-1.jpg',
    variantLabel: 'Cherry Profile, 129 Keys',
    unitPrice: 56,
  },
  {
    name: 'Linear Switch Pack',
    image: '/images/products/switches/switch-1.jpg',
    variantLabel: '70 pcs, Lubed',
    unitPrice: 38,
  },
  {
    name: 'Switch Puller Pro',
    image: '/images/products/accessories/accessory-1.jpg',
    variantLabel: 'Stainless Steel',
    unitPrice: 48,
  },
  {
    name: 'Artisan Keycap - Monolith',
    image: '/images/products/keycaps/keycap-2.jpg',
    variantLabel: 'SA Profile, Resin',
    unitPrice: 35,
  },
];

const createSeedOrders = (): AdminOrderDetail[] => {
  const now = new Date();

  return Array.from({ length: 26 }, (_, index) => {
    const orderNumber = 2048 + index;
    const orderId = `LK-${orderNumber}`;
    const customerName = CUSTOMER_NAMES[index % CUSTOMER_NAMES.length];
    const paymentMethodLabel = PAYMENT_METHODS[index % PAYMENT_METHODS.length];
    const status = ORDER_STATUSES[index % ORDER_STATUSES.length];
    const quantityA = (index % 3) + 1;
    const quantityB = (index % 2) + 1;

    const firstItem = ORDER_ITEM_CATALOG[index % ORDER_ITEM_CATALOG.length];
    const secondItem =
      ORDER_ITEM_CATALOG[(index + 2) % ORDER_ITEM_CATALOG.length];

    const items = [
      {
        id: `${orderId}-line-1`,
        name: firstItem.name,
        image: firstItem.image,
        variantLabel: firstItem.variantLabel,
        quantity: quantityA,
        unitPrice: firstItem.unitPrice,
      },
      {
        id: `${orderId}-line-2`,
        name: secondItem.name,
        image: secondItem.image,
        variantLabel: secondItem.variantLabel,
        quantity: quantityB,
        unitPrice: secondItem.unitPrice,
      },
    ];

    const total = items.reduce((accumulator, item) => {
      return accumulator + item.quantity * item.unitPrice;
    }, 0);

    const createdAt = new Date(now);
    createdAt.setDate(now.getDate() - index * 2);

    return {
      id: orderId,
      createdAt: createdAt.toISOString(),
      status,
      total,
      itemCount: items.reduce((accumulator, item) => {
        return accumulator + item.quantity;
      }, 0),
      paymentMethodLabel,
      customer: {
        name: customerName,
        email: `${customerName.toLowerCase().replace(/\s+/g, '.')}@luxekeys.dev`,
      },
      shippingAddress: {
        line1: `${10 + index} Nguyen Hue Street`,
        district: `District ${(index % 7) + 1}`,
        city: 'Ho Chi Minh City',
      },
      items,
    };
  });
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
