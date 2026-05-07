import { productsApi } from '@/features/shop/api/products.api';
import { ProductListPage } from '@/features/shop/components/pages';
import { ProductCategory } from '@/features/shop/types';
import { parseProductListQueryState } from '@/features/shop/utils/product-list-query.utils';
import {
  PRODUCT_CATEGORY_PAGE_META,
  PRODUCT_CATEGORY_SLUGS,
} from '@/features/shop/utils/product-list-options.utils';

type SearchParams = Record<string, string | string[] | undefined>;

const toURLSearchParams = (params: SearchParams): URLSearchParams => {
  const resolved = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => resolved.append(key, entry));
      return;
    }

    if (typeof value === 'string') {
      resolved.set(key, value);
    }
  });

  return resolved;
};

const DEFAULT_PRICE_BOUNDS = {
  min: 0,
  max: 500,
};

export const renderProductsPage = async (
  searchParams: Promise<SearchParams>
) => {
  const parsedSearchParams = toURLSearchParams(await searchParams);
  const initialQueryState = parseProductListQueryState(
    PRODUCT_CATEGORY_SLUGS,
    parsedSearchParams,
    DEFAULT_PRICE_BOUNDS
  );
  const initialData = await productsApi
    .getProducts(initialQueryState)
    .catch(() => undefined);

  return (
    <ProductListPage
      pageMeta={PRODUCT_CATEGORY_PAGE_META.all}
      defaultCategories={[]}
      showCategoryFilter
      initialData={initialData}
      initialQueryState={initialQueryState}
      initialPriceBounds={initialData?.priceBounds ?? DEFAULT_PRICE_BOUNDS}
    />
  );
};

export const renderCategoryProductsPage = async (
  category: ProductCategory,
  searchParams: Promise<SearchParams>
) => {
  const parsedSearchParams = toURLSearchParams(await searchParams);
  const initialQueryState = parseProductListQueryState(
    [category],
    parsedSearchParams,
    DEFAULT_PRICE_BOUNDS
  );
  const initialData = await productsApi
    .getProducts(initialQueryState)
    .catch(() => undefined);

  return (
    <ProductListPage
      pageMeta={PRODUCT_CATEGORY_PAGE_META[category]}
      defaultCategories={[category]}
      showCategoryFilter={false}
      initialData={initialData}
      initialQueryState={initialQueryState}
      initialPriceBounds={initialData?.priceBounds ?? DEFAULT_PRICE_BOUNDS}
    />
  );
};
