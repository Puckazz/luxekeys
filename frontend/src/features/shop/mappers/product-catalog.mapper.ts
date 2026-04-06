import type { ProductListItem } from '@/features/shop/types';
import type {
  ProductCatalogDefaults,
  ProductCatalogItem,
} from '@/features/shop/types/product-catalog.types';

export const DEFAULT_PRODUCT_CATALOG_VALUES: ProductCatalogDefaults = {
  layout: '75%',
  switchType: 'Linear',
  features: ['Hotswap PCB'],
  caseMaterial: 'ABS Plastic',
};

export const mapCatalogItemToProductListItem = (
  item: ProductCatalogItem,
  defaults: ProductCatalogDefaults = DEFAULT_PRODUCT_CATALOG_VALUES
): ProductListItem => {
  const category = item.category ?? 'keyboards';

  return {
    ...item,
    category,
    layout: item.layout ?? defaults.layout,
    switchType: item.switchType ?? defaults.switchType,
    features: item.features ?? defaults.features,
    caseMaterial: item.caseMaterial ?? defaults.caseMaterial,
  };
};
