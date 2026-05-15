import { ProductType } from '../../../generated/prisma/index.js';

const PRODUCT_SKU_MAX_LENGTH = 120;

const SKU_WORD_ABBREVIATIONS: Record<string, string> = {
  WHITE: 'WHT',
  BLACK: 'BLK',
  BROWN: 'BRN',
  BLUE: 'BLU',
  GRAY: 'GRY',
  GREY: 'GRY',
  SILVER: 'SLV',
  YELLOW: 'YLW',
  NAVY: 'NVY',
  MINT: 'MNT',
  PURPLE: 'PPL',
  PINK: 'PNK',
  GREEN: 'GRN',
  RED: 'RED',
  HOTSWAP: 'HS',
  HOT: 'HOT',
  SWAP: 'SWP',
  LINEAR: 'LIN',
  TACTILE: 'TAC',
  CLICKY: 'CLK',
  BASE: 'BASE',
  FULL: 'FULL',
  RETRO: 'RTR',
};

const trimTrailingHyphen = (value: string) => {
  return value.replace(/-+$/g, '');
};

export const normalizeSkuSegment = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const tokenizeSkuSource = (value?: string | null): string[] => {
  return normalizeSkuSegment(value).split('-').filter(Boolean);
};

const compactSkuWord = (token: string): string => {
  if (SKU_WORD_ABBREVIATIONS[token]) {
    return SKU_WORD_ABBREVIATIONS[token];
  }

  if (/\d/.test(token)) {
    return token;
  }

  if (token.length <= 2) {
    return token;
  }

  return token.slice(0, 1);
};

const compactSkuBrandWord = (token: string): string => {
  if (SKU_WORD_ABBREVIATIONS[token]) {
    return SKU_WORD_ABBREVIATIONS[token];
  }

  if (/\d/.test(token)) {
    return token;
  }

  if (token.length <= 3) {
    return token;
  }

  return token.slice(0, 1);
};

const compactSkuModelWord = (token: string): string => {
  if (/\d/.test(token)) {
    return token;
  }

  if (token.length <= 2) {
    return token;
  }

  return token.slice(0, 1);
};

const compactSkuAttribute = (value?: string | null): string => {
  const tokens = tokenizeSkuSource(value);

  if (tokens.length === 0) {
    return '';
  }

  return tokens.map(compactSkuWord).join('');
};

const buildSkuModelCode = (
  productName: string,
  brandToken?: string | null,
): string => {
  const brandParts = tokenizeSkuSource(brandToken);
  const productParts = tokenizeSkuSource(productName);

  if (productParts.length === 0) {
    return '';
  }

  const dedupedProductParts =
    brandParts.length > 0 && productParts[0] === brandParts[0]
      ? productParts.slice(1)
      : productParts;

  const sourceParts = [...brandParts, ...dedupedProductParts];

  if (sourceParts.length === 0) {
    return '';
  }

  return [
    ...brandParts.map(compactSkuBrandWord),
    ...dedupedProductParts.map(compactSkuModelWord),
  ].join('');
};

export const normalizeSkuValue = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  return trimTrailingHyphen(
    normalizeSkuSegment(value).slice(0, PRODUCT_SKU_MAX_LENGTH),
  );
};

export type GenerateProductVariantSkuInput = {
  productName: string;
  brandToken?: string | null;
  productType: ProductType;
  color?: string | null;
  layout?: string | null;
  switchType?: string | null;
};

export const generateProductVariantSku = ({
  productName,
  brandToken,
  productType,
  color,
  layout,
  switchType,
}: GenerateProductVariantSkuInput): string => {
  const modelCode = buildSkuModelCode(productName, brandToken);

  if (!modelCode) {
    return '';
  }

  const segments = [
    modelCode,
    compactSkuAttribute(color),
    compactSkuAttribute(
      productType === ProductType.KEYBOARD ? layout : switchType,
    ),
  ].filter(Boolean);

  return trimTrailingHyphen(
    segments.join('-').slice(0, PRODUCT_SKU_MAX_LENGTH),
  );
};
