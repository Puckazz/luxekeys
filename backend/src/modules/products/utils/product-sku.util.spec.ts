import { ProductType } from '../../../generated/prisma/index.js';
import {
  generateProductVariantSku,
  normalizeSkuValue,
} from './product-sku.util.js';

describe('product SKU utils', () => {
  it('should normalize manual SKU values to uppercase hyphenated tokens', () => {
    expect(normalizeSkuValue(' custom sku / 01 ')).toBe('CUSTOM-SKU-01');
  });

  it('should generate SKU from brand, product, and keyboard attributes', () => {
    expect(
      generateProductVariantSku({
        productName: 'Q1 Max',
        brandToken: 'Keychron',
        productType: ProductType.KEYBOARD,
        color: 'Carbon Black',
        layout: '75%',
      }),
    ).toBe('KQ1M-CBLK-75');
  });

  it('should generate a compact SKU without LK prefix for long names', () => {
    expect(
      generateProductVariantSku({
        productName: 'Glorious Spacefact Retro',
        brandToken: 'Glorious',
        productType: ProductType.KEYBOARD,
        color: 'White',
        layout: '75%',
      }),
    ).toBe('GSR-WHT-75');
  });

  it('should return empty when the product name cannot produce a SKU', () => {
    expect(
      generateProductVariantSku({
        productName: '   ',
        brandToken: 'Keychron',
        productType: ProductType.ACCESSORY,
        color: 'Black',
        switchType: 'Desk Mat',
      }),
    ).toBe('');
  });
});
