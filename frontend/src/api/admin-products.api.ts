import type {
  AdminProduct,
  AdminProductCategory,
  AdminProductListApiResponse,
  AdminProductVariant,
} from '@/features/admin/types';
import type {
  AdminProductStatusFilter,
  AdminProductListQueryState,
  UpsertAdminProductInput,
} from '@/features/admin/types/admin-products.types';
import type {
  AdminInventoryBulkUpdateInput,
  AdminInventoryBulkUpdateResponse,
  AdminInventoryItem,
  AdminInventoryListApiResponse,
  AdminInventoryListQueryState,
  AdminInventoryStatusFilter,
} from '@/features/admin/types/admin-inventory.types';
import { getInventoryStockStatus } from '@/features/admin/utils/admin-products.utils';

const MOCK_NETWORK_DELAY = 160;

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const createId = (prefix: string) => {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
};

const nowIso = () => {
  return new Date().toISOString();
};

const sumVariantStock = (variants: AdminProductVariant[]) => {
  return variants.reduce((total, variant) => total + variant.stock, 0);
};

const minVariantPrice = (variants: AdminProductVariant[]) => {
  return Math.min(...variants.map((variant) => variant.price));
};

const sortProducts = (
  products: AdminProduct[],
  sort: AdminProductListQueryState['sort']
) => {
  const next = [...products];

  if (sort === 'name-asc') {
    next.sort((left, right) => left.name.localeCompare(right.name));
    return next;
  }

  if (sort === 'stock-desc') {
    next.sort(
      (left, right) =>
        sumVariantStock(right.variants) - sumVariantStock(left.variants)
    );
    return next;
  }

  if (sort === 'price-asc') {
    next.sort(
      (left, right) =>
        minVariantPrice(left.variants) - minVariantPrice(right.variants)
    );
    return next;
  }

  if (sort === 'price-desc') {
    next.sort(
      (left, right) =>
        minVariantPrice(right.variants) - minVariantPrice(left.variants)
    );
    return next;
  }

  next.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

  return next;
};

const buildVariant = (
  input: Omit<AdminProductVariant, 'id'> & {
    id?: string;
  }
): AdminProductVariant => {
  return {
    id: input.id ?? createId('variant'),
    color: input.color,
    switchType: input.switchType,
    sku: input.sku,
    originalPrice: input.originalPrice,
    price: input.price,
    stock: input.stock,
    status: input.status,
  };
};

const createSeedProducts = (): AdminProduct[] => {
  const createdAt = nowIso();
  const pulseProducts = Array.from({ length: 11 }, (_, index) => ({
    id: `prod_pulse_switch_${index + 1}`,
    name: `Pulse Switch Pack ${index + 1}`,
    category: 'switches' as const,
    description: 'Factory-lubed switch pack for smooth typing feel.',
    thumbnail:
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=80',
    status: 'active' as const,
    createdAt,
    updatedAt: createdAt,
    variants: [
      {
        id: `var_pulse_smoke_linear_${index + 1}`,
        color: 'Smoke Gray',
        switchType: 'Linear',
        sku: `PULSE-SMK-LIN-${index + 1}`,
        originalPrice: 39,
        price: 34,
        stock: 240,
        status: 'active' as const,
      },
    ],
  }));

  return [
    {
      id: 'prod_nova75',
      name: 'Nova75 Wireless Keyboard',
      category: 'keyboards',
      description:
        'Aluminum 75% keyboard with gasket mount, tri-mode wireless, and hot-swap PCB.',
      thumbnail:
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80',
      status: 'active',
      createdAt,
      updatedAt: createdAt,
      variants: [
        {
          id: 'var_nova75_black_linear',
          color: 'Matte Black',
          switchType: 'Linear',
          sku: 'NOVA75-BLK-LIN',
          originalPrice: 229,
          price: 189,
          stock: 54,
          status: 'active',
        },
        {
          id: 'var_nova75_cream_tactile',
          color: 'Cream',
          switchType: 'Tactile',
          sku: 'NOVA75-CRM-TAC',
          originalPrice: 239,
          price: 199,
          stock: 22,
          status: 'active',
        },
      ],
    },
    {
      id: 'prod_aurora_caps',
      name: 'Aurora PBT Keycap Set',
      category: 'keycaps',
      description:
        'Double-shot PBT keycap set with clean legends and full compatibility kit.',
      thumbnail:
        'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=1200&q=80',
      status: 'draft',
      createdAt,
      updatedAt: createdAt,
      variants: [
        {
          id: 'var_aurora_ocean_linear',
          color: 'Ocean Blue',
          switchType: 'Linear',
          sku: 'AURORA-OCE-LIN',
          originalPrice: 99,
          price: 79,
          stock: 102,
          status: 'active',
        },
        {
          id: 'var_aurora_sand_tactile',
          color: 'Sand White',
          switchType: 'Tactile',
          sku: 'AURORA-SND-TAC',
          originalPrice: 99,
          price: 79,
          stock: 48,
          status: 'draft',
        },
      ],
    },
    ...pulseProducts,
  ];
};

let productsStore: AdminProduct[] = createSeedProducts();

const normalizeSearchTerm = (value: string) => {
  return value.trim().toLowerCase();
};

const filterByCategory = (
  products: AdminProduct[],
  category: AdminProductCategory | 'all'
) => {
  if (category === 'all') {
    return products;
  }

  return products.filter((product) => product.category === category);
};

const filterByStatus = (
  products: AdminProduct[],
  status: AdminProductStatusFilter
) => {
  if (status === 'all') {
    return products;
  }

  if (status === 'out-of-stock') {
    return products.filter((product) => {
      return (
        product.status !== 'archived' && sumVariantStock(product.variants) <= 0
      );
    });
  }

  return products.filter((product) => product.status === status);
};

const filterBySearch = (products: AdminProduct[], search: string) => {
  const normalizedSearch = normalizeSearchTerm(search);

  if (!normalizedSearch) {
    return products;
  }

  return products.filter((product) => {
    const variantSkuMatch = product.variants.some((variant) => {
      return normalizeSearchTerm(variant.sku).includes(normalizedSearch);
    });

    return (
      normalizeSearchTerm(product.name).includes(normalizedSearch) ||
      normalizeSearchTerm(product.description).includes(normalizedSearch) ||
      variantSkuMatch
    );
  });
};

const buildInventoryItems = (
  products: AdminProduct[]
): AdminInventoryItem[] => {
  return products.flatMap((product) => {
    const totalStock = sumVariantStock(product.variants);

    return product.variants.map((variant) => {
      return {
        product,
        variantId: variant.id,
        variantSku: variant.sku,
        variantColor: variant.color,
        variantSwitchType: variant.switchType,
        variantStock: variant.stock,
        totalStock,
        stockStatus: getInventoryStockStatus(variant.stock),
      };
    });
  });
};

const filterInventoryByStatus = (
  items: AdminInventoryItem[],
  status: AdminInventoryStatusFilter
) => {
  if (status === 'all') {
    return items;
  }

  return items.filter((item) => item.stockStatus === status);
};

const filterInventoryBySearch = (
  items: AdminInventoryItem[],
  search: string
) => {
  const normalizedSearch = normalizeSearchTerm(search);

  if (!normalizedSearch) {
    return items;
  }

  return items.filter((item) => {
    return (
      normalizeSearchTerm(item.product.name).includes(normalizedSearch) ||
      normalizeSearchTerm(item.product.description).includes(
        normalizedSearch
      ) ||
      normalizeSearchTerm(item.variantSku).includes(normalizedSearch) ||
      normalizeSearchTerm(item.variantColor).includes(normalizedSearch) ||
      normalizeSearchTerm(item.variantSwitchType).includes(normalizedSearch)
    );
  });
};

const sortInventoryItems = (
  items: AdminInventoryItem[],
  sort: AdminInventoryListQueryState['sort']
) => {
  const next = [...items];

  if (sort === 'name-asc') {
    next.sort((left, right) =>
      left.product.name.localeCompare(right.product.name)
    );
    return next;
  }

  if (sort === 'stock-asc') {
    next.sort((left, right) => left.variantStock - right.variantStock);
    return next;
  }

  if (sort === 'stock-desc') {
    next.sort((left, right) => right.variantStock - left.variantStock);
    return next;
  }

  next.sort(
    (left, right) =>
      new Date(right.product.updatedAt).getTime() -
      new Date(left.product.updatedAt).getTime()
  );

  return next;
};

const paginateInventory = (
  items: AdminInventoryItem[],
  page: number,
  pageSize: number
): Pick<AdminInventoryListApiResponse, 'items' | 'meta'> => {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: items.slice(start, end),
    meta: {
      page: currentPage,
      pageSize,
      totalItems,
      totalPages,
    },
  };
};

const paginate = (
  products: AdminProduct[],
  page: number,
  pageSize: number
): AdminProductListApiResponse => {
  const totalItems = products.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: products.slice(start, end),
    meta: {
      page: currentPage,
      pageSize,
      totalItems,
      totalPages,
    },
  };
};

export const adminProductsApi = {
  getProducts: async (
    queryState: AdminProductListQueryState
  ): Promise<AdminProductListApiResponse> => {
    await delay(MOCK_NETWORK_DELAY);

    const withoutArchived =
      queryState.status === 'archived'
        ? productsStore
        : productsStore.filter((product) => product.status !== 'archived');

    const withCategory = filterByCategory(withoutArchived, queryState.category);
    const withStatus = filterByStatus(withCategory, queryState.status);
    const withSearch = filterBySearch(withStatus, queryState.search);
    const sorted = sortProducts(withSearch, queryState.sort);

    return paginate(sorted, queryState.page, queryState.pageSize);
  },

  getInventory: async (
    queryState: AdminInventoryListQueryState
  ): Promise<AdminInventoryListApiResponse> => {
    await delay(MOCK_NETWORK_DELAY);

    const activeProducts = productsStore.filter(
      (product) => product.status !== 'archived'
    );
    const withCategory = filterByCategory(activeProducts, queryState.category);
    const flattened = buildInventoryItems(withCategory);
    const withStatus = filterInventoryByStatus(flattened, queryState.status);
    const withSearch = filterInventoryBySearch(withStatus, queryState.search);
    const sorted = sortInventoryItems(withSearch, queryState.sort);
    const paginated = paginateInventory(
      sorted,
      queryState.page,
      queryState.pageSize
    );

    const summary = withSearch.reduce(
      (accumulator, item) => {
        if (item.stockStatus === 'low-stock') {
          accumulator.lowStockItems += 1;
        }

        if (item.stockStatus === 'out-of-stock') {
          accumulator.outOfStockItems += 1;
        }

        return accumulator;
      },
      {
        totalVariants: withSearch.length,
        lowStockItems: 0,
        outOfStockItems: 0,
      }
    );

    return {
      ...paginated,
      summary,
    };
  },

  createProduct: async (
    input: UpsertAdminProductInput
  ): Promise<AdminProduct> => {
    await delay(MOCK_NETWORK_DELAY);

    const timestamp = nowIso();

    const product: AdminProduct = {
      id: createId('product'),
      name: input.name,
      category: input.category,
      description: input.description,
      thumbnail: input.thumbnail,
      status: input.status,
      createdAt: timestamp,
      updatedAt: timestamp,
      variants: input.variants.map((variant) => buildVariant(variant)),
    };

    productsStore = [product, ...productsStore];

    return product;
  },

  updateProduct: async (
    input: UpsertAdminProductInput
  ): Promise<AdminProduct> => {
    await delay(MOCK_NETWORK_DELAY);

    if (!input.id) {
      throw new Error('Product id is required for update.');
    }

    const existingProduct = productsStore.find(
      (product) => product.id === input.id
    );

    if (!existingProduct) {
      throw new Error('Product not found.');
    }

    const updated: AdminProduct = {
      ...existingProduct,
      name: input.name,
      category: input.category,
      description: input.description,
      thumbnail: input.thumbnail,
      status: input.status,
      variants: input.variants.map((variant) => buildVariant(variant)),
      updatedAt: nowIso(),
    };

    productsStore = productsStore.map((product) => {
      return product.id === updated.id ? updated : product;
    });

    return updated;
  },

  softDeleteProduct: async (productId: string): Promise<AdminProduct> => {
    await delay(MOCK_NETWORK_DELAY);

    const existingProduct = productsStore.find(
      (product) => product.id === productId
    );

    if (!existingProduct) {
      throw new Error('Product not found.');
    }

    const archivedProduct: AdminProduct = {
      ...existingProduct,
      status: 'archived',
      updatedAt: nowIso(),
    };

    productsStore = productsStore.map((product) => {
      return product.id === productId ? archivedProduct : product;
    });

    return archivedProduct;
  },

  restoreProduct: async (productId: string): Promise<AdminProduct> => {
    await delay(MOCK_NETWORK_DELAY);

    const existingProduct = productsStore.find(
      (product) => product.id === productId
    );

    if (!existingProduct) {
      throw new Error('Product not found.');
    }

    const restoredProduct: AdminProduct = {
      ...existingProduct,
      status: 'draft',
      updatedAt: nowIso(),
    };

    productsStore = productsStore.map((product) => {
      return product.id === productId ? restoredProduct : product;
    });

    return restoredProduct;
  },

  bulkUpdateInventoryStock: async (
    input: AdminInventoryBulkUpdateInput
  ): Promise<AdminInventoryBulkUpdateResponse> => {
    await delay(MOCK_NETWORK_DELAY);

    const updatesByProduct = input.updates.reduce((accumulator, update) => {
      const list = accumulator.get(update.productId) ?? [];
      list.push(update);
      accumulator.set(update.productId, list);
      return accumulator;
    }, new Map<string, AdminInventoryBulkUpdateInput['updates']>());

    productsStore = productsStore.map((product) => {
      const updates = updatesByProduct.get(product.id);

      if (!updates || updates.length === 0) {
        return product;
      }

      const updatesByVariantId = new Map(
        updates.map((update) => [update.variantId, update])
      );

      const nextVariants = product.variants.map((variant) => {
        const update = updatesByVariantId.get(variant.id);

        if (!update) {
          return variant;
        }

        return {
          ...variant,
          stock: update.stock,
        };
      });

      return {
        ...product,
        variants: nextVariants,
        updatedAt: nowIso(),
      };
    });

    return {
      updatedCount: input.updates.length,
    };
  },
};
