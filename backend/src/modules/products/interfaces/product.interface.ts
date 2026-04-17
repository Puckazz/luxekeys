export type ProductType = 'keyboard' | 'switch' | 'keycap' | 'accessory';

export type ProductSwitchKind = 'linear' | 'tactile' | 'clicky' | 'magnetic';

export type CustomString = string & {};

export type KeyboardLayout =
  | '60%'
  | '65%'
  | '75%'
  | 'TKL'
  | 'Fullsize'
  | '96%'
  | CustomString;

export type KeyboardSoftware = 'QMK' | 'VIA' | 'Driver';

export type KeyboardMountStyle = 'gasket' | 'tray' | 'top';

export type KeycapMaterial = 'PBT' | 'ABS';

export type KeycapLegend = 'dye-sub' | 'double-shot' | 'laser';

export type KeycapProfile = 'Cherry' | 'OEM' | 'XDA' | 'SA' | CustomString;

export type AccessoryKind =
  | 'cable'
  | 'wrist-rest'
  | 'deskmat'
  | 'stabilizer'
  | 'other';

export interface ProductVariantAttributes {
  color?: string;
  switchType?: string;
  layout?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  stock?: number;
  attributes: ProductVariantAttributes;
}

export interface BaseProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;

  price: number;
  compareAtPrice?: number;

  brand: string;
  category: string;
  type: ProductType;

  images: string[];
  thumbnail: string;

  specs?: Record<string, string>;
  variants?: ProductVariant[];

  stock: number;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface KeyboardProduct extends BaseProduct {
  type: 'keyboard';
  keyboard: {
    layout: KeyboardLayout;
    keyCount: number;
    connectivity: {
      wired: boolean;
      bluetooth: boolean;
      wireless24g: boolean;
    };
    battery?: number;
    switch: {
      brand: string;
      type: ProductSwitchKind;
      hotSwappable: boolean;
    };
    rgb: boolean;
    software?: KeyboardSoftware;
    mountStyle?: KeyboardMountStyle;
    plateMaterial?: string;
    caseMaterial?: string;
    features?: string[];
  };
}

export interface SwitchProduct extends BaseProduct {
  type: 'switch';
  switch: {
    brand: string;
    type: ProductSwitchKind;
    actuationForce?: number;
    bottomOutForce?: number;
    travelDistance?: number;
    factoryLubed?: boolean;
    material?: string;
    pins: 3 | 5;
    quantity: number;
  };
}

export interface KeycapProduct extends BaseProduct {
  type: 'keycap';
  keycap: {
    material: KeycapMaterial;
    profile: KeycapProfile;
    legend: KeycapLegend;
    compatibility: string[];
    keyCount: number;
    thickness?: string;
  };
}

export interface AccessoryProduct extends BaseProduct {
  type: 'accessory';
  accessory: {
    kind: AccessoryKind;
    material?: string;
    length?: string;
    compatibility?: string[];
  };
}

export type Product =
  | KeyboardProduct
  | SwitchProduct
  | KeycapProduct
  | AccessoryProduct;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
