import { productsApi } from '@/features/shop/api/products.api';
import { ProductListPage } from '@/features/shop/components/pages';
import { ProductCategory } from '@/features/shop/types';
import { parseProductListQueryState } from '@/features/shop/utils/product-list-query.utils';

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

export const renderCategoryProductsPage = async (
  category: ProductCategory,
  searchParams: Promise<SearchParams>
) => {
  const parsedSearchParams = toURLSearchParams(await searchParams);
  const initialQueryState = parseProductListQueryState(
    category,
    parsedSearchParams,
    DEFAULT_PRICE_BOUNDS
  );
  const initialData = await productsApi
    .getProducts(initialQueryState)
    .catch(() => undefined);

  return (
    <ProductListPage
      category={category}
      initialData={initialData}
      initialQueryState={initialQueryState}
      initialPriceBounds={initialData?.priceBounds ?? DEFAULT_PRICE_BOUNDS}
    />
  );
};
