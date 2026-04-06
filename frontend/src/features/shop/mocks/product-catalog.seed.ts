import type {
  AccessoriesCatalogItem,
  KeycapsCatalogItem,
  SwitchesCatalogItem,
} from '@/features/shop/types/product-catalog.types';

type AccessorySeedInput = Omit<AccessoriesCatalogItem, 'category'>;
type SwitchSeedInput = Omit<SwitchesCatalogItem, 'category'>;
type KeycapSeedInput = Omit<KeycapsCatalogItem, 'category'>;

export const createAccessoryCatalogItem = (
  input: AccessorySeedInput
): AccessoriesCatalogItem => {
  return {
    ...input,
    category: 'accessories',
  };
};

export const createSwitchCatalogItem = (
  input: SwitchSeedInput
): SwitchesCatalogItem => {
  return {
    ...input,
    category: 'switches',
  };
};

export const createKeycapCatalogItem = (
  input: KeycapSeedInput
): KeycapsCatalogItem => {
  return {
    ...input,
    category: 'keycaps',
  };
};
