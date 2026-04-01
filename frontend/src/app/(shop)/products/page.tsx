import { productsApi } from '@/api/products.api';
import ProductListPage from '@/features/shop/components/ProductListPage';
import { productsCatalog } from '@/features/shop/mocks/products.data';
import { parseProductListQueryState } from '@/features/shop/utils/product-list-query.utils';

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const toURLSearchParams = (
  params: Record<string, string | string[] | undefined>
): URLSearchParams => {
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

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = toURLSearchParams(await searchParams);
  const initialQueryState = parseProductListQueryState(
    params,
    initialPriceBounds
  );
  const initialData = await productsApi.getProducts(initialQueryState);

  return (
    <ProductListPage
      initialData={initialData}
      initialQueryState={initialQueryState}
      initialPriceBounds={initialPriceBounds}
    />
  );
}
