import { productsApi } from '@/api/products.api';
import { ProductListPage } from '@/features/shop/components/pages';
import { productsCatalog } from '@/features/shop/mocks/products.data';
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

const initialPriceBounds = {
  min: Math.min(...productsCatalog.map((product) => product.price)),
  max: Math.max(...productsCatalog.map((product) => product.price)),
};

export const renderCategoryProductsPage = async (
  category: ProductCategory,
  searchParams: Promise<SearchParams>
) => {
  const parsedSearchParams = toURLSearchParams(await searchParams);
  const initialQueryState = parseProductListQueryState(
    category,
    parsedSearchParams,
    initialPriceBounds
  );
  const initialData = await productsApi.getProducts(initialQueryState);

  return (
    <ProductListPage
      category={category}
      initialData={initialData}
      initialQueryState={initialQueryState}
      initialPriceBounds={initialPriceBounds}
    />
  );
};
