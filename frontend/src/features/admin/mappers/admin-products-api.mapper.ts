import type {
  AdminProduct,
  AdminProductCategory,
  AdminProductStatus,
  AdminVariantStatus,
} from '@/features/admin/types';
import type {
  AdminProductApiItem,
  AdminProductApiStatus,
  AdminProductApiStatusFilter,
  AdminProductApiSummary,
  AdminProductApiType,
  AdminProductListQueryState,
  AdminProductListResponse,
  AdminProductStatusFilter,
  UpsertAdminProductInput,
} from '@/features/admin/types/admin-products.types';

const ADMIN_PRODUCTS_FALLBACK_THUMBNAIL =
  'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=80';

const categoryToApiType: Record<AdminProductCategory, AdminProductApiType> = {
  keyboards: 'KEYBOARD',
  switches: 'SWITCH',
  keycaps: 'KEYCAP',
  accessories: 'ACCESSORY',
  'barebones-kits': 'BAREBONES_KIT',
};

const apiTypeToCategory: Record<AdminProductApiType, AdminProductCategory> = {
  KEYBOARD: 'keyboards',
  SWITCH: 'switches',
  KEYCAP: 'keycaps',
  ACCESSORY: 'accessories',
  BAREBONES_KIT: 'barebones-kits',
};

const statusToApiStatus: Record<
  Exclude<AdminProductStatus, 'archived'>,
  AdminProductApiStatus
> = {
  active: 'ACTIVE',
  draft: 'INACTIVE',
};

const apiStatusToStatus: Record<AdminProductApiStatus, AdminProductStatus> = {
  ACTIVE: 'active',
  INACTIVE: 'draft',
};

const toNumber = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
};

const getVariantPayloadStock = (
  input: UpsertAdminProductInput,
  variant: UpsertAdminProductInput['variants'][number]
) => {
  if (input.productType !== 'keyboards') {
    return variant.stock;
  }

  return variant.switchOptions.reduce((total, option) => total + option.stock, 0);
};

const getDefaultSwitchOption = (
  variant: UpsertAdminProductInput['variants'][number]
) => {
  return (
    variant.switchOptions.find((option) => option.isDefault) ??
    variant.switchOptions[0]
  );
};

const getVariantPayloadPrice = (
  input: UpsertAdminProductInput,
  variant: UpsertAdminProductInput['variants'][number]
) => {
  if (input.productType !== 'keyboards') {
    return {
      price: variant.price,
      originalPrice: variant.originalPrice ?? null,
    };
  }

  const defaultSwitchOption = getDefaultSwitchOption(variant);

  return {
    price: defaultSwitchOption?.price ?? variant.price,
    originalPrice: defaultSwitchOption?.originalPrice ?? null,
  };
};

export const productCategoryToApiType = (
  category: AdminProductCategory
): AdminProductApiType => {
  return categoryToApiType[category];
};

export const productStatusFilterToApiStatus = (
  status: AdminProductStatusFilter
): AdminProductApiStatusFilter | undefined => {
  if (status === 'all') {
    return undefined;
  }

  if (status === 'archived') {
    return 'ARCHIVED';
  }

  if (status === 'out-of-stock') {
    return 'OUT_OF_STOCK';
  }

  return statusToApiStatus[status];
};

export const productSortToApiParams = (
  sort: AdminProductListQueryState['sort']
): { sortBy: string; sortOrder: 'asc' | 'desc' } => {
  if (sort === 'name-asc') {
    return { sortBy: 'name', sortOrder: 'asc' };
  }

  if (sort === 'stock-desc') {
    return { sortBy: 'stock', sortOrder: 'desc' };
  }

  if (sort === 'price-asc') {
    return { sortBy: 'basePrice', sortOrder: 'asc' };
  }

  if (sort === 'price-desc') {
    return { sortBy: 'basePrice', sortOrder: 'desc' };
  }

  return { sortBy: 'createdAt', sortOrder: 'desc' };
};

export const mapApiProductToAdminProduct = (
  product: AdminProductApiItem
): AdminProduct => {
  const isKeyboardProduct = product.type === 'KEYBOARD';

  return {
    id: product.id,
    name: product.name,
    shortDescription: product.shortDescription ?? undefined,
    productType: apiTypeToCategory[product.type],
    brandId: product.brand?.id,
    brandName: product.brand?.name,
    catalogCategoryId: product.category?.id,
    catalogCategoryName: product.category?.name,
    description:
      product.description ?? 'No product description provided.',
    thumbnail: product.thumbnailUrl ?? ADMIN_PRODUCTS_FALLBACK_THUMBNAIL,
    tags: product.tags ?? [],
    isFeatured: product.isFeatured,
    status: product.deletedAt ? 'archived' : apiStatusToStatus[product.status],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    images:
      product.images?.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        altText: image.altText ?? undefined,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
        createdAt: image.createdAt,
        cloudinaryPublicId: image.cloudinaryPublicId ?? undefined,
      })) ?? [],
    specs:
      product.specs?.map((spec) => ({
        id: spec.id,
        groupName: spec.groupName ?? '',
        specKey: spec.specKey,
        specValue: spec.specValue,
      })) ?? [],
    variants: product.variants.map((variant) => {
      const switchOption = variant.switchOptions?.[0];
      const priceSource = isKeyboardProduct && switchOption ? switchOption : variant;

      return {
        id: variant.id,
        thumbnailImageId: variant.thumbnailImage?.id,
        color: variant.color ?? '',
        layout: (isKeyboardProduct
          ? (variant.layout ?? '')
          : '') as AdminProduct['variants'][number]['layout'],
        switchType: isKeyboardProduct
          ? (switchOption?.switchType ?? variant.name)
          : variant.name,
        sku: variant.sku,
        originalPrice:
          priceSource.compareAtPrice === null || priceSource.compareAtPrice === undefined
            ? null
            : toNumber(priceSource.compareAtPrice),
        price: toNumber(priceSource.price),
        stock: variant.stock,
        isDefault: variant.isDefault,
        status: (variant.isActive
          ? 'active'
          : 'draft') satisfies AdminVariantStatus,
        switchOptions: (variant.switchOptions ?? []).map((option) => ({
          id: option.id,
          name: option.name,
          switchType: option.switchType,
          originalPrice:
            option.compareAtPrice === null || option.compareAtPrice === undefined
              ? null
              : toNumber(option.compareAtPrice),
          price: toNumber(option.price),
          stock: option.stock,
          isDefault: option.isDefault,
          status: (option.isActive
            ? 'active'
            : 'draft') satisfies AdminVariantStatus,
        })),
      };
    }),
  };
};

export const mapApiSummary = (
  summary: AdminProductApiSummary
): AdminProductListResponse['summary'] => {
  return {
    all: summary.all,
    active: summary.ACTIVE,
    draft: summary.INACTIVE,
    archived: summary.ARCHIVED,
    'out-of-stock': summary.OUT_OF_STOCK,
  };
};

export const mapUpsertInputToPayload = (input: UpsertAdminProductInput) => {
  return {
    name: input.name,
    shortDescription: input.shortDescription || undefined,
    description: input.description,
    type: productCategoryToApiType(input.productType),
    brandId: input.brandId || undefined,
    categoryId: input.catalogCategoryId || undefined,
    status: statusToApiStatus[input.status],
    thumbnailUrl: input.thumbnail.trim() || undefined,
    tags: input.tags,
    isFeatured: input.isFeatured,
    specs: input.specs.map((spec, index) => ({
      id: spec.id,
      groupName: spec.groupName?.trim() || undefined,
      specKey: spec.specKey,
      specValue: spec.specValue,
      sortOrder: index,
    })),
    variants: input.variants.map((variant) => {
      const priceFields = getVariantPayloadPrice(input, variant);

      return {
        id: variant.id,
        thumbnailImageId: variant.thumbnailImageId,
        sku: variant.sku,
        color: variant.color,
        layout: input.productType === 'keyboards' ? variant.layout || undefined : undefined,
        switchType: variant.switchType,
        originalPrice: priceFields.originalPrice,
        price: priceFields.price,
        stock: getVariantPayloadStock(input, variant),
        isDefault: variant.isDefault,
        isActive: variant.status === 'active',
        switchOptions: variant.switchOptions.map((option, index) => ({
          id: option.id,
          name: option.name,
          switchType: option.switchType,
          originalPrice: option.originalPrice,
          price: option.price,
          stock: option.stock,
          isDefault: option.isDefault || index === 0,
          isActive: option.status === 'active',
          sortOrder: index,
        })),
      };
    }),
  };
};
