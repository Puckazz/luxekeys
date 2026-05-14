import { randomUUID } from 'crypto';
import {
  UserRole,
  UserStatus,
  ProductType,
  ProductStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../generated/prisma/index.js';

// ─── Primitives ────────────────────────────────────────────────────────────────

export const uuid = () => randomUUID();

export const now = () => new Date();

// ─── User ──────────────────────────────────────────────────────────────────────

export function createMockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: uuid(),
    email: 'test@example.com',
    phone: null,
    fullName: 'Test User',
    passwordHash: '$2b$10$hashedpassword',
    avatarUrl: null,
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    lastLoginAt: null,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
    ...overrides,
  };
}

export function createMockAdminUser(overrides: Record<string, unknown> = {}) {
  return createMockUser({
    role: UserRole.ADMIN,
    email: 'admin@example.com',
    ...overrides,
  });
}

// ─── Category ─────────────────────────────────────────────────────────────────

export function createMockCategory(overrides: Record<string, unknown> = {}) {
  return {
    id: uuid(),
    name: 'Keyboards',
    slug: 'keyboards',
    description: 'Mechanical keyboards and enthusiast typing gear.',
    parentId: null,
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
    parent: null,
    children: [],
    _count: { products: 0 },
    ...overrides,
  };
}

// ─── Brand ────────────────────────────────────────────────────────────────────

export function createMockBrand(overrides: Record<string, unknown> = {}) {
  return {
    id: uuid(),
    name: 'Keychron',
    slug: 'keychron',
    logoUrl: null,
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
    _count: { products: 0 },
    ...overrides,
  };
}

// ─── Product ──────────────────────────────────────────────────────────────────

export function createMockProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: uuid(),
    name: 'Keychron K2',
    slug: 'keychron-k2',
    shortDescription: null,
    description: null,
    type: ProductType.KEYBOARD,
    status: ProductStatus.ACTIVE,
    brandId: null,
    categoryId: null,
    basePrice: '99.00',
    compareAtPrice: null,
    thumbnailUrl: null,
    tags: [],
    isFeatured: false,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
    brand: null,
    category: null,
    images: [],
    variants: [],
    specs: [],
    _count: { variants: 0, reviews: 0 },
    ...overrides,
  };
}

// ─── Product Variant ──────────────────────────────────────────────────────────

export function createMockVariant(overrides: Record<string, unknown> = {}) {
  return {
    id: uuid(),
    productId: uuid(),
    sku: 'K2-BLK-001',
    name: 'Black / US Layout',
    price: '99.00',
    compareAtPrice: null,
    color: 'Black',
    layout: 'TKL',
    stock: 100,
    isDefault: true,
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
    switchOptions: [],
    ...overrides,
  };
}

// ─── Address ──────────────────────────────────────────────────────────────────

export function createMockAddress(overrides: Record<string, unknown> = {}) {
  return {
    id: uuid(),
    userId: uuid(),
    fullName: 'Test User',
    phone: '0901234567',
    streetAddress: '123 Main St',
    province: 'Ho Chi Minh',
    city: 'District 1',
    country: 'Vietnam',
    isDefault: false,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
    ...overrides,
  };
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export function createMockCart(overrides: Record<string, unknown> = {}) {
  return {
    id: uuid(),
    userId: uuid(),
    items: [],
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function createMockCartItem(overrides: Record<string, unknown> = {}) {
  return {
    id: uuid(),
    cartId: uuid(),
    variantId: uuid(),
    switchOptionId: null,
    quantity: 1,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

// ─── Order ────────────────────────────────────────────────────────────────────

export function createMockOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: uuid(),
    orderCode: 'LK-ABC123-XY01',
    userId: uuid(),
    addressId: null,
    status: OrderStatus.PENDING,
    paymentMethod: PaymentMethod.PAYPAL,
    paymentStatus: PaymentStatus.PENDING,
    subtotalAmount: '99.00',
    discountAmount: '0.00',
    shippingAmount: '0.00',
    totalAmount: '99.00',
    note: null,
    trackingCode: null,
    paypalOrderId: null,
    placedAt: now(),
    createdAt: now(),
    updatedAt: now(),
    address: null,
    items: [],
    ...overrides,
  };
}

// ─── Review ───────────────────────────────────────────────────────────────────

export function createMockReview(overrides: Record<string, unknown> = {}) {
  return {
    id: uuid(),
    userId: uuid(),
    productId: uuid(),
    rating: 5,
    title: 'Great keyboard',
    content: 'Very happy with the purchase.',
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
    user: createMockUser(),
    ...overrides,
  };
}

// ─── WishlistItem ─────────────────────────────────────────────────────────────

export function createMockWishlistItem(
  overrides: Record<string, unknown> = {},
) {
  return {
    id: uuid(),
    userId: uuid(),
    productId: uuid(),
    createdAt: now(),
    product: createMockProduct(),
    ...overrides,
  };
}

// ─── RefreshToken ─────────────────────────────────────────────────────────────

export function createMockRefreshToken(
  overrides: Record<string, unknown> = {},
) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  return {
    id: uuid(),
    userId: uuid(),
    tokenHash: '$2b$10$hashedtoken',
    userAgent: 'test-agent',
    ipAddress: '127.0.0.1',
    expiresAt,
    revokedAt: null,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}
