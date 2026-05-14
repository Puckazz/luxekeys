import 'dotenv/config';
import * as crypto from 'crypto';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  UserRole,
  ProductType,
  ProductStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../src/generated/prisma/index.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Simple SHA-256 hash (for testing only — use bcrypt in production) */
function hashPassword(plain: string): string {
  return crypto.createHash('sha256').update(plain).digest('hex');
}

function buildOrderAddressSnapshot(address: {
  fullName: string;
  phone: string;
  streetAddress: string;
  province: string;
  city: string;
  country: string;
}) {
  return {
    shippingFullName: address.fullName,
    shippingPhone: address.phone,
    shippingStreetAddress: address.streetAddress,
    shippingProvince: address.province,
    shippingCity: address.city,
    shippingCountry: address.country,
  };
}

function daysAgo(days: number, hour = 10, minute = 0): Date {
  const date = new Date();
  date.setUTCHours(hour, minute, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);

  return date;
}

async function syncVariantStocksFromSwitchOptions(): Promise<number> {
  const variants = await prisma.productVariant.findMany({
    where: { deletedAt: null },
    include: { switchOptions: true },
  });

  let updatedCount = 0;

  for (const variant of variants) {
    if (variant.switchOptions.length === 0) {
      continue;
    }

    const stock = variant.switchOptions.reduce((sum, switchOption) => {
      return sum + switchOption.stock;
    }, 0);

    if (variant.stock === stock) {
      continue;
    }

    await prisma.productVariant.update({
      where: { id: variant.id },
      data: { stock },
    });
    updatedCount += 1;
  }

  return updatedCount;
}

async function syncProductPricesFromDefaultVariants(): Promise<number> {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      variants: {
        where: { deletedAt: null, isActive: true },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        include: {
          switchOptions: {
            where: { deletedAt: null, isActive: true },
            orderBy: [
              { isDefault: 'desc' },
              { sortOrder: 'asc' },
              { createdAt: 'asc' },
            ],
          },
        },
      },
    },
  });

  let updatedCount = 0;

  for (const product of products) {
    const defaultVariant =
      product.variants.find((variant) => variant.isDefault) ??
      product.variants[0];

    if (!defaultVariant) {
      continue;
    }

    const defaultSwitchOption =
      defaultVariant.switchOptions.find((option) => option.isDefault) ??
      defaultVariant.switchOptions[0];
    const basePrice = defaultSwitchOption?.price ?? defaultVariant.price;
    const compareAtPrice =
      defaultSwitchOption?.compareAtPrice ?? defaultVariant.compareAtPrice;

    const basePriceMatches = product.basePrice.equals(basePrice);
    const compareAtPriceMatches =
      product.compareAtPrice === null
        ? compareAtPrice === null
        : compareAtPrice !== null &&
          product.compareAtPrice.equals(compareAtPrice);

    if (basePriceMatches && compareAtPriceMatches) {
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        basePrice,
        compareAtPrice,
      },
    });
    updatedCount += 1;
  }

  return updatedCount;
}

async function findDefaultSwitchOptionId(
  variantId: string,
): Promise<string | null> {
  const switchOption = await prisma.productSwitchOption.findFirst({
    where: {
      variantId,
      isDefault: true,
      isActive: true,
      deletedAt: null,
    },
    select: { id: true },
  });

  return switchOption?.id ?? null;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Starting seed...\n');

  console.log('🧹  Clearing existing data...');

  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.wishlistItem.deleteMany(),
    prisma.review.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.productSpec.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.brand.deleteMany(),
    prisma.address.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log('   ✅  Database cleared\n');

  // ── 1. Users ──────────────────────────────────────────────────────────────
  console.log('👤  Seeding users...');

  await prisma.user.upsert({
    where: { email: 'admin@luxekeys.com' },
    update: {},
    create: {
      email: 'admin@luxekeys.com',
      phone: '+1-800-000-0001',
      passwordHash: hashPassword('Admin@123456'),
      fullName: 'LuxeKeys Admin',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin',
      role: UserRole.ADMIN,
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: 'alice.johnson@example.com' },
    update: {},
    create: {
      email: 'alice.johnson@example.com',
      phone: '+1-415-555-0101',
      passwordHash: hashPassword('Alice@123456'),
      fullName: 'Alice Johnson',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Alice',
      role: UserRole.CUSTOMER,
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'bob.smith@example.com' },
    update: {},
    create: {
      email: 'bob.smith@example.com',
      phone: '+1-213-555-0202',
      passwordHash: hashPassword('Bob@123456'),
      fullName: 'Bob Smith',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Bob',
      role: UserRole.CUSTOMER,
    },
  });

  const customer3 = await prisma.user.upsert({
    where: { email: 'carol.lee@example.com' },
    update: {},
    create: {
      email: 'carol.lee@example.com',
      phone: '+1-312-555-0303',
      passwordHash: hashPassword('Carol@123456'),
      fullName: 'Carol Lee',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Carol',
      role: UserRole.CUSTOMER,
    },
  });

  console.log(`   ✅  Created ${4} users\n`);

  // ── 2. Addresses ──────────────────────────────────────────────────────────
  console.log('📍  Seeding addresses...');

  const addr1 = await prisma.address.create({
    data: {
      userId: customer1.id,
      fullName: 'Alice Johnson',
      phone: '+1-415-555-0101',
      streetAddress: '742 Evergreen Terrace',
      province: 'California',
      city: 'San Francisco',
      country: 'United States',
      isDefault: true,
    },
  });

  const addr2 = await prisma.address.create({
    data: {
      userId: customer2.id,
      fullName: 'Bob Smith',
      phone: '+1-213-555-0202',
      streetAddress: '1600 Amphitheatre Pkwy',
      province: 'California',
      city: 'Los Angeles',
      country: 'United States',
      isDefault: true,
    },
  });

  const addr3 = await prisma.address.create({
    data: {
      userId: customer3.id,
      fullName: 'Carol Lee',
      phone: '+1-312-555-0303',
      streetAddress: '233 S Wacker Dr',
      province: 'Illinois',
      city: 'Chicago',
      country: 'United States',
      isDefault: true,
    },
  });

  console.log(`   ✅  Created ${3} addresses\n`);

  // ── 3. Brands ─────────────────────────────────────────────────────────────
  console.log('🏷️   Seeding brands...');

  const brandKeychron = await prisma.brand.upsert({
    where: { slug: 'keychron' },
    update: {},
    create: {
      name: 'Keychron',
      slug: 'keychron',
      logoUrl:
        'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
  });

  const brandDucky = await prisma.brand.upsert({
    where: { slug: 'ducky' },
    update: {},
    create: {
      name: 'Ducky',
      slug: 'ducky',
      logoUrl:
        'https://images.unsplash.com/photo-1511467687858-23d1928afd91?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
  });

  const brandGMK = await prisma.brand.upsert({
    where: { slug: 'gmk' },
    update: {},
    create: {
      name: 'GMK',
      slug: 'gmk',
      logoUrl:
        'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
  });

  const brandZMK = await prisma.brand.upsert({
    where: { slug: 'zmk' },
    update: {},
    create: {
      name: 'ZMK / Gateron',
      slug: 'zmk',
      logoUrl:
        'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
  });

  const brandKBDfans = await prisma.brand.upsert({
    where: { slug: 'kbdfans' },
    update: {},
    create: {
      name: 'KBDfans',
      slug: 'kbdfans',
      logoUrl:
        'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
  });

  const brandDrop = await prisma.brand.upsert({
    where: { slug: 'drop' },
    update: {},
    create: {
      name: 'Drop',
      slug: 'drop',
      logoUrl:
        'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
  });

  await prisma.brand.upsert({
    where: { slug: 'glorious' },
    update: {},
    create: {
      name: 'Glorious',
      slug: 'glorious',
      logoUrl:
        'https://images.unsplash.com/photo-1511467687858-23d1928afd91?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
  });

  const brandKailh = await prisma.brand.upsert({
    where: { slug: 'kailh' },
    update: {},
    create: {
      name: 'Kailh',
      slug: 'kailh',
      logoUrl:
        'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
  });

  console.log(`   ✅  Created ${9} brands\n`);

  // ── 4. Categories ─────────────────────────────────────────────────────────
  console.log('📁  Seeding categories...');

  const catKeyboards = await prisma.category.upsert({
    where: { slug: 'keyboards' },
    update: {},
    create: { name: 'Keyboards', slug: 'keyboards', isActive: true },
  });

  const catSwitches = await prisma.category.upsert({
    where: { slug: 'switches' },
    update: {},
    create: { name: 'Switches', slug: 'switches', isActive: true },
  });

  const catKeycaps = await prisma.category.upsert({
    where: { slug: 'keycaps' },
    update: {},
    create: { name: 'Keycaps', slug: 'keycaps', isActive: true },
  });

  const catAccessories = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: { name: 'Accessories', slug: 'accessories', isActive: true },
  });

  // Sub-categories
  const catTKL = await prisma.category.upsert({
    where: { slug: 'tkl-keyboards' },
    update: {},
    create: {
      name: 'TKL Keyboards',
      slug: 'tkl-keyboards',
      parentId: catKeyboards.id,
      isActive: true,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'full-size-keyboards' },
    update: {},
    create: {
      name: 'Full-Size Keyboards',
      slug: 'full-size-keyboards',
      parentId: catKeyboards.id,
      isActive: true,
    },
  });

  const cat75 = await prisma.category.upsert({
    where: { slug: '75-keyboards' },
    update: {},
    create: {
      name: '75% Keyboards',
      slug: '75-keyboards',
      parentId: catKeyboards.id,
      isActive: true,
    },
  });

  const catLinearSwitches = await prisma.category.upsert({
    where: { slug: 'linear-switches' },
    update: {},
    create: {
      name: 'Linear Switches',
      slug: 'linear-switches',
      parentId: catSwitches.id,
      isActive: true,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'tactile-switches' },
    update: {},
    create: {
      name: 'Tactile Switches',
      slug: 'tactile-switches',
      parentId: catSwitches.id,
      isActive: true,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'clicky-switches' },
    update: {},
    create: {
      name: 'Clicky Switches',
      slug: 'clicky-switches',
      parentId: catSwitches.id,
      isActive: true,
    },
  });

  const catDeskMats = await prisma.category.upsert({
    where: { slug: 'desk-mats' },
    update: { parentId: catAccessories.id },
    create: {
      name: 'Desk Mats',
      slug: 'desk-mats',
      parentId: catAccessories.id,
      isActive: true,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'wrist-rests' },
    update: { parentId: catAccessories.id },
    create: {
      name: 'Wrist Rests',
      slug: 'wrist-rests',
      parentId: catAccessories.id,
      isActive: true,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'cables' },
    update: { parentId: catAccessories.id },
    create: {
      name: 'Cables',
      slug: 'cables',
      parentId: catAccessories.id,
      isActive: true,
    },
  });

  console.log(`   ✅  Created ${13} categories\n`);

  // ── 5. Products ───────────────────────────────────────────────────────────
  console.log('📦  Seeding products...');

  // ── Product 1: Keychron Q3 Pro ────────────────────────────────────────────
  const prodQ3Pro = await prisma.product.upsert({
    where: { slug: 'keychron-q3-pro-tkl' },
    update: { tags: ['TKL', 'Wireless', 'QMK/VIA', 'Gasket'] },
    create: {
      name: 'Keychron Q3 Pro TKL',
      slug: 'keychron-q3-pro-tkl',
      type: ProductType.KEYBOARD,
      status: ProductStatus.ACTIVE,
      brandId: brandKeychron.id,
      categoryId: catTKL.id,
      basePrice: 199.99,
      compareAtPrice: 229.99,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
      tags: ['TKL', 'Wireless', 'QMK/VIA', 'Gasket'],
      isFeatured: true,
      shortDescription:
        'Wireless TKL gasket-mount keyboard with knob, QMK/VIA support.',
      description:
        'The Keychron Q3 Pro is a tenkeyless wireless mechanical keyboard featuring a premium gasket-mount structure, triple-mode Bluetooth/USB-C connectivity, full QMK & VIA support, and a custom rotary knob. Built with an aircraft-grade aluminum frame and south-facing RGB PCB.',
    },
  });

  await prisma.productSpec.createMany({
    data: [
      {
        productId: prodQ3Pro.id,
        groupName: 'General',
        specKey: 'Layout',
        specValue: 'TKL (80%)',
        sortOrder: 1,
      },
      {
        productId: prodQ3Pro.id,
        groupName: 'General',
        specKey: 'Mount Style',
        specValue: 'Gasket',
        sortOrder: 2,
      },
      {
        productId: prodQ3Pro.id,
        groupName: 'General',
        specKey: 'Connectivity',
        specValue: 'Bluetooth 5.1 / USB-C',
        sortOrder: 3,
      },
      {
        productId: prodQ3Pro.id,
        groupName: 'General',
        specKey: 'Battery',
        specValue: '4000 mAh',
        sortOrder: 4,
      },
      {
        productId: prodQ3Pro.id,
        groupName: 'Build',
        specKey: 'Case Material',
        specValue: 'Anodized Aluminum',
        sortOrder: 5,
      },
      {
        productId: prodQ3Pro.id,
        groupName: 'Build',
        specKey: 'PCB',
        specValue: 'Hot-swap, South-facing RGB',
        sortOrder: 6,
      },
      {
        productId: prodQ3Pro.id,
        groupName: 'Software',
        specKey: 'Firmware',
        specValue: 'QMK / VIA',
        sortOrder: 7,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: prodQ3Pro.id,
        imageUrl:
          'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80',
        altText: 'Q3 Pro front view',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        productId: prodQ3Pro.id,
        imageUrl:
          'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
        altText: 'Q3 Pro side view',
        sortOrder: 2,
      },
      {
        productId: prodQ3Pro.id,
        imageUrl:
          'https://images.unsplash.com/photo-1511467687858-23d1928afd91?auto=format&fit=crop&w=800&q=80',
        altText: 'Q3 Pro RGB lighting',
        sortOrder: 3,
      },
    ],
    skipDuplicates: true,
  });

  const varQ3ProBlackRed = await prisma.productVariant.upsert({
    where: { sku: 'KQ3P-BLK-RED-HS' },
    update: {},
    create: {
      productId: prodQ3Pro.id,
      sku: 'KQ3P-BLK-RED-HS',
      name: 'Carbon Black',
      price: 199.99,
      compareAtPrice: 229.99,
      color: 'Carbon Black',
      layout: 'TKL',
      stock: 0,
      isDefault: true,
      isActive: true,
      switchOptions: {
        create: [
          {
            name: 'Keychron K Pro Red',
            switchType: 'Linear',
            price: 199.99,
            compareAtPrice: 229.99,
            stock: 42,
            isDefault: true,
            sortOrder: 1,
          },
          {
            name: 'Keychron K Pro Brown',
            switchType: 'Tactile',
            price: 199.99,
            compareAtPrice: 229.99,
            stock: 18,
            isDefault: false,
            sortOrder: 2,
          },
          {
            name: 'Keychron K Pro Blue',
            switchType: 'Clicky',
            price: 199.99,
            compareAtPrice: 229.99,
            stock: 0,
            isDefault: false,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'KQ3P-WHT-BRN-HS' },
    update: {},
    create: {
      productId: prodQ3Pro.id,
      sku: 'KQ3P-WHT-BRN-HS',
      name: 'Off-White',
      price: 199.99,
      compareAtPrice: 229.99,
      color: 'Off-White',
      layout: 'TKL',
      stock: 0,
      isDefault: false,
      isActive: true,
      switchOptions: {
        create: [
          {
            name: 'Keychron K Pro Red',
            switchType: 'Linear',
            price: 199.99,
            compareAtPrice: 229.99,
            stock: 28,
            isDefault: false,
            sortOrder: 1,
          },
          {
            name: 'Keychron K Pro Brown',
            switchType: 'Tactile',
            price: 199.99,
            compareAtPrice: 229.99,
            stock: 15,
            isDefault: true,
            sortOrder: 2,
          },
        ],
      },
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'KQ3P-NVY-BLU-HS' },
    update: {},
    create: {
      productId: prodQ3Pro.id,
      sku: 'KQ3P-NVY-BLU-HS',
      name: 'Navy Blue',
      price: 199.99,
      color: 'Navy Blue',
      layout: 'TKL',
      stock: 0,
      isDefault: false,
      isActive: true,
      switchOptions: {
        create: [
          {
            name: 'Keychron K Pro Red',
            switchType: 'Linear',
            price: 199.99,
            stock: 12,
            isDefault: false,
            sortOrder: 1,
          },
          {
            name: 'Keychron K Pro Brown',
            switchType: 'Tactile',
            price: 199.99,
            stock: 8,
            isDefault: false,
            sortOrder: 2,
          },
          {
            name: 'Keychron K Pro Blue',
            switchType: 'Clicky',
            price: 199.99,
            stock: 15,
            isDefault: true,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  // ── Product 2: Ducky One 3 SF ─────────────────────────────────────────────
  const prodDuckyOne3 = await prisma.product.upsert({
    where: { slug: 'ducky-one-3-sf-65' },
    update: { tags: ['65%', 'Hotswap', 'PBT Keycaps'] },
    create: {
      name: 'Ducky One 3 SF 65%',
      slug: 'ducky-one-3-sf-65',
      type: ProductType.KEYBOARD,
      status: ProductStatus.ACTIVE,
      brandId: brandDucky.id,
      categoryId: cat75.id,
      basePrice: 129.99,
      compareAtPrice: 149.99,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=800&q=80',
      tags: ['65%', 'Hotswap', 'PBT Keycaps'],
      isFeatured: true,
      shortDescription:
        'Compact 65% keyboard with hot-swap PCB and PBT keycaps.',
      description:
        'The Ducky One 3 SF is a 65% hot-swap ready keyboard. It comes with double-shot PBT keycaps in multiple colorways and supports per-key RGB lighting. Features a high-quality polycarbonate top and brass plate.',
    },
  });

  await prisma.productSpec.createMany({
    data: [
      {
        productId: prodDuckyOne3.id,
        groupName: 'General',
        specKey: 'Layout',
        specValue: '65%',
        sortOrder: 1,
      },
      {
        productId: prodDuckyOne3.id,
        groupName: 'General',
        specKey: 'Mount Style',
        specValue: 'Top Mount',
        sortOrder: 2,
      },
      {
        productId: prodDuckyOne3.id,
        groupName: 'General',
        specKey: 'Connectivity',
        specValue: 'USB-C',
        sortOrder: 3,
      },
      {
        productId: prodDuckyOne3.id,
        groupName: 'Build',
        specKey: 'Plate Material',
        specValue: 'Brass',
        sortOrder: 4,
      },
      {
        productId: prodDuckyOne3.id,
        groupName: 'Build',
        specKey: 'Keycaps',
        specValue: 'Double-shot PBT',
        sortOrder: 5,
      },
      {
        productId: prodDuckyOne3.id,
        groupName: 'Build',
        specKey: 'PCB',
        specValue: 'Hot-swap, RGB',
        sortOrder: 6,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: prodDuckyOne3.id,
        imageUrl:
          'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
        altText: 'Ducky One 3 SF Daybreak',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        productId: prodDuckyOne3.id,
        imageUrl:
          'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80',
        altText: 'Ducky One 3 SF Fuji',
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  });

  const varDuckyDaybreakRed = await prisma.productVariant.upsert({
    where: { sku: 'DUCK-ONE3-DB-RED' },
    update: {},
    create: {
      productId: prodDuckyOne3.id,
      sku: 'DUCK-ONE3-DB-RED',
      name: 'Daybreak',
      price: 129.99,
      compareAtPrice: 149.99,
      color: 'Daybreak',
      layout: '65%',
      stock: 0,
      isDefault: true,
      isActive: true,
      switchOptions: {
        create: [
          {
            name: 'Cherry MX Red',
            switchType: 'Linear',
            price: 129.99,
            compareAtPrice: 149.99,
            stock: 55,
            isDefault: true,
            sortOrder: 1,
          },
          {
            name: 'Cherry MX Speed Silver',
            switchType: 'Linear',
            price: 129.99,
            compareAtPrice: 149.99,
            stock: 20,
            isDefault: false,
            sortOrder: 2,
          },
          {
            name: 'Cherry MX Brown',
            switchType: 'Tactile',
            price: 129.99,
            compareAtPrice: 149.99,
            stock: 30,
            isDefault: false,
            sortOrder: 3,
          },
          {
            name: 'Cherry MX Blue',
            switchType: 'Clicky',
            price: 129.99,
            compareAtPrice: 149.99,
            stock: 15,
            isDefault: false,
            sortOrder: 4,
          },
        ],
      },
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'DUCK-ONE3-FJ-BLU' },
    update: {},
    create: {
      productId: prodDuckyOne3.id,
      sku: 'DUCK-ONE3-FJ-BLU',
      name: 'Fuji',
      price: 129.99,
      compareAtPrice: 149.99,
      color: 'Fuji',
      layout: '65%',
      stock: 0,
      isDefault: false,
      isActive: true,
      switchOptions: {
        create: [
          {
            name: 'Cherry MX Red',
            switchType: 'Linear',
            price: 129.99,
            compareAtPrice: 149.99,
            stock: 30,
            isDefault: false,
            sortOrder: 1,
          },
          {
            name: 'Cherry MX Brown',
            switchType: 'Tactile',
            price: 129.99,
            compareAtPrice: 149.99,
            stock: 25,
            isDefault: false,
            sortOrder: 2,
          },
          {
            name: 'Cherry MX Blue',
            switchType: 'Clicky',
            price: 129.99,
            compareAtPrice: 149.99,
            stock: 0,
            isDefault: true,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  // ── Product 3: Gateron G Pro 3.0 Yellow (Switches) ────────────────────────
  const prodGateronYellow = await prisma.product.upsert({
    where: { slug: 'gateron-g-pro-3-yellow-linear' },
    update: { tags: ['Linear', 'Factory Lubed'] },
    create: {
      name: 'Gateron G Pro 3.0 Yellow Linear Switches',
      slug: 'gateron-g-pro-3-yellow-linear',
      type: ProductType.SWITCH,
      status: ProductStatus.ACTIVE,
      brandId: brandZMK.id,
      categoryId: catLinearSwitches.id,
      basePrice: 18.99,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
      tags: ['Linear', 'Factory Lubed'],
      isFeatured: false,
      shortDescription:
        'Ultra-smooth factory-lubed linear switches, 35g actuation.',
      description:
        'Gateron G Pro 3.0 Yellow switches are renowned for their buttery-smooth feel and whisper-quiet operation. Pre-lubed at the factory with a 35g actuation force, they are ideal for speed typists and gamers. Available in packs of 10 or 110.',
    },
  });

  await prisma.productSpec.createMany({
    data: [
      {
        productId: prodGateronYellow.id,
        groupName: 'Switch',
        specKey: 'Type',
        specValue: 'Linear',
        sortOrder: 1,
      },
      {
        productId: prodGateronYellow.id,
        groupName: 'Switch',
        specKey: 'Actuation Force',
        specValue: '35g',
        sortOrder: 2,
      },
      {
        productId: prodGateronYellow.id,
        groupName: 'Switch',
        specKey: 'Total Travel',
        specValue: '4.0 mm',
        sortOrder: 3,
      },
      {
        productId: prodGateronYellow.id,
        groupName: 'Switch',
        specKey: 'Pre-travel',
        specValue: '2.0 mm',
        sortOrder: 4,
      },
      {
        productId: prodGateronYellow.id,
        groupName: 'Switch',
        specKey: 'Stem Material',
        specValue: 'POM',
        sortOrder: 5,
      },
      {
        productId: prodGateronYellow.id,
        groupName: 'Switch',
        specKey: 'Lubing',
        specValue: 'Factory lubed',
        sortOrder: 6,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: prodGateronYellow.id,
        imageUrl:
          'https://images.unsplash.com/photo-1511467687858-23d1928afd91?auto=format&fit=crop&w=800&q=80',
        altText: 'Gateron Yellow pack of 110',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productVariant.upsert({
    where: { sku: 'GAT-YLW-3-10PK' },
    update: {},
    create: {
      productId: prodGateronYellow.id,
      sku: 'GAT-YLW-3-10PK',
      name: '10-pack',
      price: 1.99,
      color: 'Yellow',
      stock: 500,
      isDefault: false,
      isActive: true,
    },
  });

  const varGateronYellow110 = await prisma.productVariant.upsert({
    where: { sku: 'GAT-YLW-3-110PK' },
    update: {},
    create: {
      productId: prodGateronYellow.id,
      sku: 'GAT-YLW-3-110PK',
      name: '110-pack',
      price: 18.99,
      color: 'Yellow',
      stock: 200,
      isDefault: true,
      isActive: true,
    },
  });

  // ── Product 4: GMK NightCity Keycaps ─────────────────────────────────────
  const prodGMKNightCity = await prisma.product.upsert({
    where: { slug: 'gmk-nightcity-keycaps' },
    update: { tags: ['Cherry Profile', 'ABS', 'Doubleshot'] },
    create: {
      name: 'GMK NightCity Keycaps',
      slug: 'gmk-nightcity-keycaps',
      type: ProductType.KEYCAP,
      status: ProductStatus.ACTIVE,
      brandId: brandGMK.id,
      categoryId: catKeycaps.id,
      basePrice: 159.99,
      compareAtPrice: 185.0,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=800&q=80',
      tags: ['Cherry Profile', 'ABS', 'Doubleshot'],
      isFeatured: true,
      shortDescription:
        'Cherry profile ABS double-shot keycaps inspired by cyberpunk cityscapes.',
      description:
        'GMK NightCity is a high-end Cherry profile keycap set featuring vibrant neon colorways on a dark base. Each keycap is double-shot ABS with precise legends. Includes Base Kit, Numpad Kit, and Novelties.',
    },
  });

  await prisma.productSpec.createMany({
    data: [
      {
        productId: prodGMKNightCity.id,
        groupName: 'Keycap',
        specKey: 'Profile',
        specValue: 'Cherry',
        sortOrder: 1,
      },
      {
        productId: prodGMKNightCity.id,
        groupName: 'Keycap',
        specKey: 'Material',
        specValue: 'ABS Double-shot',
        sortOrder: 2,
      },
      {
        productId: prodGMKNightCity.id,
        groupName: 'Keycap',
        specKey: 'Legends',
        specValue: 'Double-shot',
        sortOrder: 3,
      },
      {
        productId: prodGMKNightCity.id,
        groupName: 'Keycap',
        specKey: 'Colorway',
        specValue: 'Neon-on-Charcoal',
        sortOrder: 4,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: prodGMKNightCity.id,
        imageUrl:
          'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
        altText: 'GMK NightCity base kit',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        productId: prodGMKNightCity.id,
        imageUrl:
          'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80',
        altText: 'GMK NightCity numpad kit',
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  });

  const varGMKBaseKit = await prisma.productVariant.upsert({
    where: { sku: 'GMK-NC-BASE' },
    update: {},
    create: {
      productId: prodGMKNightCity.id,
      sku: 'GMK-NC-BASE',
      name: 'Base Kit',
      price: 159.99,
      compareAtPrice: 185.0,
      color: 'Neon-on-Charcoal',
      stock: 75,
      isDefault: true,
      isActive: true,
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'GMK-NC-NUM' },
    update: {},
    create: {
      productId: prodGMKNightCity.id,
      sku: 'GMK-NC-NUM',
      name: 'Numpad Kit',
      price: 49.99,
      color: 'Neon-on-Charcoal',
      stock: 60,
      isDefault: false,
      isActive: true,
    },
  });

  // ── Product 5: KBDfans TOFU65 Barebones Kit ───────────────────────────────
  const prodTofu65 = await prisma.product.upsert({
    where: { slug: 'kbdfans-tofu65-barebones' },
    update: { tags: ['65%', 'Aluminum', 'Barebones', 'Hotswap'] },
    create: {
      name: 'KBDfans TOFU65 Barebones Kit',
      slug: 'kbdfans-tofu65-barebones',
      type: ProductType.BAREBONES_KIT,
      status: ProductStatus.ACTIVE,
      brandId: brandKBDfans.id,
      categoryId: cat75.id,
      basePrice: 169.0,
      compareAtPrice: 199.0,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
      tags: ['65%', 'Aluminum', 'Barebones', 'Hotswap'],
      isFeatured: true,
      shortDescription:
        'Premium 65% aluminum barebones kit — tray mount, hotswap PCB.',
      description:
        'The KBDfans TOFU65 is a compact 65% barebones keyboard kit featuring a thick aluminum case, integrated brass weight, hot-swap PCB, and screw-in PCB stabilizers. Ideal for enthusiasts who prefer to choose their own switches and keycaps.',
    },
  });

  await prisma.productSpec.createMany({
    data: [
      {
        productId: prodTofu65.id,
        groupName: 'General',
        specKey: 'Layout',
        specValue: '65%',
        sortOrder: 1,
      },
      {
        productId: prodTofu65.id,
        groupName: 'General',
        specKey: 'Mount Style',
        specValue: 'Tray Mount',
        sortOrder: 2,
      },
      {
        productId: prodTofu65.id,
        groupName: 'Build',
        specKey: 'Case Material',
        specValue: '6063 Anodized Aluminum',
        sortOrder: 3,
      },
      {
        productId: prodTofu65.id,
        groupName: 'Build',
        specKey: 'Weight',
        specValue: 'Brass plate weight',
        sortOrder: 4,
      },
      {
        productId: prodTofu65.id,
        groupName: 'Build',
        specKey: 'PCB',
        specValue: 'Hot-swap, per-key RGB',
        sortOrder: 5,
      },
      {
        productId: prodTofu65.id,
        groupName: 'Build',
        specKey: 'Stabilizers',
        specValue: 'Screw-in PCB stabs included',
        sortOrder: 6,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: prodTofu65.id,
        imageUrl:
          'https://images.unsplash.com/photo-1511467687858-23d1928afd91?auto=format&fit=crop&w=800&q=80',
        altText: 'TOFU65 Silver',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        productId: prodTofu65.id,
        imageUrl:
          'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=800&q=80',
        altText: 'TOFU65 Black',
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  });

  const varTofu65Silver = await prisma.productVariant.upsert({
    where: { sku: 'TOFU65-SLV' },
    update: {},
    create: {
      productId: prodTofu65.id,
      sku: 'TOFU65-SLV',
      name: 'Silver',
      price: 169.0,
      compareAtPrice: 199.0,
      color: 'Silver',
      layout: '65%',
      stock: 35,
      isDefault: true,
      isActive: true,
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'TOFU65-BLK' },
    update: {},
    create: {
      productId: prodTofu65.id,
      sku: 'TOFU65-BLK',
      name: 'Black',
      price: 169.0,
      compareAtPrice: 199.0,
      color: 'Jet Black',
      layout: '65%',
      stock: 20,
      isDefault: false,
      isActive: true,
    },
  });

  // ── Product 6: Keychron K8 Pro (Full-size) ────────────────────────────────
  const prodK8Pro = await prisma.product.upsert({
    where: { slug: 'keychron-k8-pro-tkl-wireless' },
    update: { tags: ['TKL', 'Wireless', 'Hotswap', 'QMK/VIA'] },
    create: {
      name: 'Keychron K8 Pro TKL Wireless',
      slug: 'keychron-k8-pro-tkl-wireless',
      type: ProductType.KEYBOARD,
      status: ProductStatus.ACTIVE,
      brandId: brandKeychron.id,
      categoryId: catTKL.id,
      basePrice: 109.99,
      compareAtPrice: 129.99,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
      tags: ['TKL', 'Wireless', 'Hotswap', 'QMK/VIA'],
      isFeatured: false,
      shortDescription:
        'Wireless TKL keyboard with hot-swap PCB, RGB, and QMK support.',
      description:
        'The Keychron K8 Pro is a no-frills wireless TKL with hot-swap sockets, full RGB, and QMK/VIA compatibility. A fantastic entry-level enthusiast board at an accessible price point.',
    },
  });

  await prisma.productSpec.createMany({
    data: [
      {
        productId: prodK8Pro.id,
        groupName: 'General',
        specKey: 'Layout',
        specValue: 'TKL (80%)',
        sortOrder: 1,
      },
      {
        productId: prodK8Pro.id,
        groupName: 'General',
        specKey: 'Connectivity',
        specValue: 'Bluetooth 5.1 / USB-C',
        sortOrder: 2,
      },
      {
        productId: prodK8Pro.id,
        groupName: 'Build',
        specKey: 'Case Material',
        specValue: 'Aluminum Frame',
        sortOrder: 3,
      },
      {
        productId: prodK8Pro.id,
        groupName: 'Build',
        specKey: 'PCB',
        specValue: 'Hot-swap, RGB',
        sortOrder: 4,
      },
      {
        productId: prodK8Pro.id,
        groupName: 'Software',
        specKey: 'Firmware',
        specValue: 'QMK / VIA',
        sortOrder: 5,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: prodK8Pro.id,
        imageUrl:
          'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80',
        altText: 'K8 Pro Space Gray',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    skipDuplicates: true,
  });

  const varK8ProGray = await prisma.productVariant.upsert({
    where: { sku: 'KK8P-GRY-RED' },
    update: {},
    create: {
      productId: prodK8Pro.id,
      sku: 'KK8P-GRY-RED',
      name: 'Space Gray',
      price: 109.99,
      compareAtPrice: 129.99,
      color: 'Space Gray',
      layout: 'TKL',
      stock: 0,
      isDefault: true,
      isActive: true,
      switchOptions: {
        create: [
          {
            name: 'Keychron K Pro Red',
            switchType: 'Linear',
            price: 109.99,
            compareAtPrice: 129.99,
            stock: 60,
            isDefault: true,
            sortOrder: 1,
          },
          {
            name: 'Keychron K Pro Brown',
            switchType: 'Tactile',
            price: 109.99,
            compareAtPrice: 129.99,
            stock: 35,
            isDefault: false,
            sortOrder: 2,
          },
          {
            name: 'Keychron K Pro Blue',
            switchType: 'Clicky',
            price: 109.99,
            compareAtPrice: 129.99,
            stock: 20,
            isDefault: false,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  // ── New Keyboard: Anne Pro 2 (60%) ───────────────────────────────────────
  const prodAnnePro2 = await prisma.product.upsert({
    where: { slug: 'anne-pro-2-60' },
    update: { tags: ['60% Layout', 'Wireless', 'RGB', 'PBT'] },
    create: {
      name: 'Anne Pro 2 60%',
      slug: 'anne-pro-2-60',
      type: ProductType.KEYBOARD,
      status: ProductStatus.ACTIVE,
      brandId: brandDucky.id,
      categoryId: catKeyboards.id,
      basePrice: 89.99,
      compareAtPrice: 99.99,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
      tags: ['60% Layout', 'Wireless', 'RGB', 'PBT'],
      isFeatured: false,
      shortDescription: 'Compact 60% wireless mechanical keyboard.',
      description:
        'The Anne Pro 2 is a legendary 60% mechanical keyboard known for its excellent build quality, wireless capabilities, and extensive software customization.',
    },
  });

  await prisma.productSpec.createMany({
    data: [
      {
        productId: prodAnnePro2.id,
        groupName: 'General',
        specKey: 'Layout',
        specValue: '60%',
        sortOrder: 1,
      },
      {
        productId: prodAnnePro2.id,
        groupName: 'General',
        specKey: 'Connectivity',
        specValue: 'Bluetooth / USB-C',
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: prodAnnePro2.id,
        imageUrl:
          'https://images.unsplash.com/photo-1511467687858-23d1928afd91?auto=format&fit=crop&w=800&q=80',
        altText: 'Anne Pro 2 White',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productVariant.create({
    data: {
      productId: prodAnnePro2.id,
      sku: 'ANNE2-WHT-BRN',
      name: 'White',
      price: 89.99,
      color: 'White',
      layout: '60%',
      stock: 0,
      isDefault: true,
      switchOptions: {
        create: [
          {
            name: 'Gateron Red',
            switchType: 'Linear',
            price: 89.99,
            stock: 50,
            isDefault: false,
            sortOrder: 1,
          },
          {
            name: 'Gateron Brown',
            switchType: 'Tactile',
            price: 89.99,
            stock: 50,
            isDefault: true,
            sortOrder: 2,
          },
          {
            name: 'Gateron Blue',
            switchType: 'Clicky',
            price: 89.99,
            stock: 30,
            isDefault: false,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  await prisma.productVariant.create({
    data: {
      productId: prodAnnePro2.id,
      sku: 'ANNE2-BLK-BLU',
      name: 'Black',
      price: 89.99,
      color: 'Black',
      layout: '60%',
      stock: 0,
      switchOptions: {
        create: [
          {
            name: 'Gateron Brown',
            switchType: 'Tactile',
            price: 89.99,
            stock: 20,
            isDefault: false,
            sortOrder: 1,
          },
          {
            name: 'Gateron Blue',
            switchType: 'Clicky',
            price: 89.99,
            stock: 30,
            isDefault: true,
            sortOrder: 2,
          },
        ],
      },
    },
  });

  // ── New Keyboard: Keychron Q1 (75%) ──────────────────────────────────────
  const prodQ1 = await prisma.product.upsert({
    where: { slug: 'keychron-q1-75' },
    update: { tags: ['75% Layout', 'Gasket', 'QMK/VIA'] },
    create: {
      name: 'Keychron Q1 75%',
      slug: 'keychron-q1-75',
      type: ProductType.KEYBOARD,
      status: ProductStatus.ACTIVE,
      brandId: brandKeychron.id,
      categoryId: cat75.id,
      basePrice: 169.99,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=800&q=80',
      tags: ['75% Layout', 'Gasket', 'QMK/VIA'],
      isFeatured: true,
      shortDescription: '75% Gasket Mount QMK/VIA Mechanical Keyboard.',
    },
  });

  await prisma.productSpec.createMany({
    data: [
      {
        productId: prodQ1.id,
        groupName: 'General',
        specKey: 'Layout',
        specValue: '75%',
        sortOrder: 1,
      },
      {
        productId: prodQ1.id,
        groupName: 'Build',
        specKey: 'Case Material',
        specValue: 'Aluminum',
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: prodQ1.id,
        imageUrl:
          'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
        altText: 'Keychron Q1 Space Gray',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productVariant.create({
    data: {
      productId: prodQ1.id,
      sku: 'KQ1-GRY-YLW',
      name: 'Space Gray',
      price: 169.99,
      color: 'Space Gray',
      layout: '75%',
      stock: 0,
      isDefault: true,
      switchOptions: {
        create: [
          {
            name: 'Gateron Yellow',
            switchType: 'Linear',
            price: 169.99,
            stock: 25,
            isDefault: true,
            sortOrder: 1,
          },
          {
            name: 'Gateron Red',
            switchType: 'Linear',
            price: 169.99,
            stock: 18,
            isDefault: false,
            sortOrder: 2,
          },
          {
            name: 'Gateron Brown',
            switchType: 'Tactile',
            price: 169.99,
            stock: 12,
            isDefault: false,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  // ── New Keycap: PBT Notion (OEM Profile) ──────────────────────────────────
  const prodPBTNotion = await prisma.product.upsert({
    where: { slug: 'pbt-notion-keycaps' },
    update: { tags: ['OEM Profile', 'PBT', 'Dye-sub'] },
    create: {
      name: 'PBT Notion Keycaps',
      slug: 'pbt-notion-keycaps',
      type: ProductType.KEYCAP,
      status: ProductStatus.ACTIVE,
      brandId: brandKBDfans.id,
      categoryId: catKeycaps.id,
      basePrice: 79.99,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80',
      tags: ['OEM Profile', 'PBT', 'Dye-sub'],
      shortDescription:
        'OEM profile PBT dye-sub keycaps inspired by productivity apps.',
    },
  });

  await prisma.productSpec.create({
    data: {
      productId: prodPBTNotion.id,
      specKey: 'Profile',
      specValue: 'OEM',
    },
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: prodPBTNotion.id,
        imageUrl:
          'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
        altText: 'PBT Notion Base Kit',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productVariant.create({
    data: {
      productId: prodPBTNotion.id,
      sku: 'PBT-NOTION-BASE',
      name: 'Base Kit',
      price: 79.99,
      color: 'White/Cyan',
      stock: 40,
      isDefault: true,
    },
  });

  // ── New Keycap: MT3 3277 (SA Profile) ───────────────────────────────────
  const prodMT33277 = await prisma.product.upsert({
    where: { slug: 'mt3-3277-keycaps' },
    update: { tags: ['SA Profile', 'ABS', 'Hi-profile'] },
    create: {
      name: 'Drop + Matt3o MT3 3277 Keycaps',
      slug: 'mt3-3277-keycaps',
      type: ProductType.KEYCAP,
      status: ProductStatus.ACTIVE,
      brandId: brandDrop.id,
      categoryId: catKeycaps.id,
      basePrice: 110.0,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1511467687858-23d1928afd91?auto=format&fit=crop&w=800&q=80',
      tags: ['SA Profile', 'ABS', 'Hi-profile'],
      shortDescription: 'Vintage inspired MT3 (SA-like) profile keycaps.',
    },
  });

  await prisma.productSpec.create({
    data: {
      productId: prodMT33277.id,
      specKey: 'Profile',
      specValue: 'SA',
    },
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: prodMT33277.id,
        imageUrl:
          'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=800&q=80',
        altText: 'MT3 3277 Base Kit',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productVariant.create({
    data: {
      productId: prodMT33277.id,
      sku: 'MT3-3277-BASE',
      name: 'Base Kit',
      price: 110.0,
      color: 'Grey/Turquoise',
      stock: 15,
      isDefault: true,
    },
  });

  // ── New Switch: Holy Panda (Tactile) ─────────────────────────────────────
  const prodHolyPanda = await prisma.product.upsert({
    where: { slug: 'drop-holy-panda-tactile' },
    update: { tags: ['Tactile', 'Premium'] },
    create: {
      name: 'Drop Holy Panda Tactile Switches',
      slug: 'drop-holy-panda-tactile',
      type: ProductType.SWITCH,
      status: ProductStatus.ACTIVE,
      brandId: brandDrop.id,
      categoryId: catSwitches.id,
      basePrice: 75.0,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
      tags: ['Tactile', 'Premium'],
      shortDescription: 'The original tactile masterpiece.',
    },
  });

  await prisma.productSpec.createMany({
    data: [
      {
        productId: prodHolyPanda.id,
        groupName: 'Switch',
        specKey: 'Type',
        specValue: 'Tactile',
        sortOrder: 1,
      },
      {
        productId: prodHolyPanda.id,
        groupName: 'Switch',
        specKey: 'Actuation Force',
        specValue: '67g',
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: prodHolyPanda.id,
        imageUrl:
          'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80',
        altText: 'Holy Panda Switches',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productVariant.create({
    data: {
      productId: prodHolyPanda.id,
      sku: 'HP-35PK',
      name: '35-pack',
      price: 35.0,
      color: 'Orange/White',
      stock: 100,
      isDefault: true,
    },
  });

  // ── New Switch: Kailh Box Navy (Clicky) ──────────────────────────────────
  const prodKailhNavy = await prisma.product.upsert({
    where: { slug: 'kailh-box-navy-clicky' },
    update: { tags: ['Clicky', 'Heavy'] },
    create: {
      name: 'Kailh Box Navy Clicky Switches',
      slug: 'kailh-box-navy-clicky',
      type: ProductType.SWITCH,
      status: ProductStatus.ACTIVE,
      brandId: brandKailh.id,
      categoryId: catSwitches.id,
      basePrice: 32.0,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
      tags: ['Clicky', 'Heavy'],
      shortDescription: 'Thick-click bar switches for ultimate tactility.',
    },
  });

  await prisma.productSpec.createMany({
    data: [
      {
        productId: prodKailhNavy.id,
        groupName: 'Switch',
        specKey: 'Type',
        specValue: 'Clicky',
        sortOrder: 1,
      },
      {
        productId: prodKailhNavy.id,
        groupName: 'Switch',
        specKey: 'Actuation Force',
        specValue: '60g',
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: prodKailhNavy.id,
        imageUrl:
          'https://images.unsplash.com/photo-1511467687858-23d1928afd91?auto=format&fit=crop&w=800&q=80',
        altText: 'Kailh Box Navy Switches',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productVariant.create({
    data: {
      productId: prodKailhNavy.id,
      sku: 'KBN-36PK',
      name: '36-pack',
      price: 32.0,
      color: 'Navy',
      stock: 80,
      isDefault: true,
    },
  });

  // ── New Keyboard: Ducky One 3 Full-size (100%) ───────────────────────────
  const prodDuckyFull = await prisma.product.upsert({
    where: { slug: 'ducky-one-3-full-size' },
    update: { tags: ['100% Layout', 'RGB', 'Hot-swap'] },
    create: {
      name: 'Ducky One 3 Full-size 100%',
      slug: 'ducky-one-3-full-size',
      type: ProductType.KEYBOARD,
      status: ProductStatus.ACTIVE,
      brandId: brandDucky.id,
      categoryId: catKeyboards.id,
      basePrice: 139.99,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=800&q=80',
      tags: ['100% Layout', 'RGB', 'Hot-swap'],
      isFeatured: false,
      shortDescription:
        'Classic full-size keyboard with modern hot-swap capabilities.',
    },
  });

  await prisma.productSpec.createMany({
    data: [
      {
        productId: prodDuckyFull.id,
        groupName: 'General',
        specKey: 'Layout',
        specValue: '100%',
        sortOrder: 1,
      },
      {
        productId: prodDuckyFull.id,
        groupName: 'General',
        specKey: 'Connectivity',
        specValue: 'USB-C',
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: prodDuckyFull.id,
        imageUrl:
          'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
        altText: 'Ducky One 3 Full-size Black',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productVariant.create({
    data: {
      productId: prodDuckyFull.id,
      sku: 'D13-FULL-BLK-RED',
      name: 'Black',
      price: 139.99,
      color: 'Black',
      layout: '100%',
      stock: 0,
      isDefault: true,
      switchOptions: {
        create: [
          {
            name: 'Cherry MX Red',
            switchType: 'Linear',
            price: 139.99,
            stock: 20,
            isDefault: true,
            sortOrder: 1,
          },
          {
            name: 'Cherry MX Brown',
            switchType: 'Tactile',
            price: 139.99,
            stock: 15,
            isDefault: false,
            sortOrder: 2,
          },
          {
            name: 'Cherry MX Blue',
            switchType: 'Clicky',
            price: 139.99,
            stock: 10,
            isDefault: false,
            sortOrder: 3,
          },
          {
            name: 'Cherry MX Silent Red',
            switchType: 'Linear',
            price: 139.99,
            stock: 8,
            isDefault: false,
            sortOrder: 4,
          },
        ],
      },
    },
  });

  // ── Product 7: Desk Mat (Accessory) ──────────────────────────────────────
  const prodDeskMat = await prisma.product.upsert({
    where: { slug: 'luxekeys-xl-desk-mat-midnight' },
    update: {
      categoryId: catDeskMats.id,
      tags: ['Desk Mat', 'XL', 'Stitched Edge'],
    },
    create: {
      name: 'LuxeKeys XL Desk Mat — Midnight',
      slug: 'luxekeys-xl-desk-mat-midnight',
      type: ProductType.ACCESSORY,
      status: ProductStatus.ACTIVE,
      categoryId: catDeskMats.id,
      basePrice: 34.99,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80',
      tags: ['Desk Mat', 'XL', 'Stitched Edge'],
      isFeatured: false,
      shortDescription:
        'Extra-large stitched desk mat with non-slip rubber base.',
      description:
        'The LuxeKeys XL Desk Mat provides a smooth, consistent surface for your keyboard and mouse. Made from premium micro-weave cloth with stitched edges and a thick non-slip rubber base. Dimensions: 900 × 400 × 4mm.',
    },
  });

  await prisma.productSpec.createMany({
    data: [
      {
        productId: prodDeskMat.id,
        groupName: 'Dimensions',
        specKey: 'Size',
        specValue: '900 × 400 mm',
        sortOrder: 1,
      },
      {
        productId: prodDeskMat.id,
        groupName: 'Dimensions',
        specKey: 'Thickness',
        specValue: '4 mm',
        sortOrder: 2,
      },
      {
        productId: prodDeskMat.id,
        groupName: 'Material',
        specKey: 'Surface',
        specValue: 'Micro-weave cloth',
        sortOrder: 3,
      },
      {
        productId: prodDeskMat.id,
        groupName: 'Material',
        specKey: 'Base',
        specValue: 'Anti-slip rubber',
        sortOrder: 4,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: prodDeskMat.id,
        imageUrl:
          'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
        altText: 'LuxeKeys Midnight Desk Mat',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productVariant.upsert({
    where: { sku: 'LKDM-MNT-XL' },
    update: {},
    create: {
      productId: prodDeskMat.id,
      sku: 'LKDM-MNT-XL',
      name: 'Midnight — XL (900×400mm)',
      price: 34.99,
      color: 'Midnight Black',
      stock: 120,
      isDefault: true,
      isActive: true,
    },
  });

  console.log(
    `   ✅  Created ${14} products with variants, specs, and images\n`,
  );

  const syncedVariantStockCount = await syncVariantStocksFromSwitchOptions();
  console.log(
    `   ✅  Synced ${syncedVariantStockCount} variant stock totals from switch options\n`,
  );
  const syncedProductPriceCount = await syncProductPricesFromDefaultVariants();
  console.log(
    `   ✅  Synced ${syncedProductPriceCount} product prices from default variants\n`,
  );

  // ── 7. Wishlist ───────────────────────────────────────────────────────────
  console.log('❤️   Seeding wishlists...');

  await prisma.wishlistItem.upsert({
    where: {
      userId_productId: { userId: customer1.id, productId: prodTofu65.id },
    },
    update: {},
    create: { userId: customer1.id, productId: prodTofu65.id },
  });

  await prisma.wishlistItem.upsert({
    where: {
      userId_productId: {
        userId: customer1.id,
        productId: prodGMKNightCity.id,
      },
    },
    update: {},
    create: { userId: customer1.id, productId: prodGMKNightCity.id },
  });

  await prisma.wishlistItem.upsert({
    where: {
      userId_productId: { userId: customer3.id, productId: prodQ3Pro.id },
    },
    update: {},
    create: { userId: customer3.id, productId: prodQ3Pro.id },
  });

  await prisma.wishlistItem.upsert({
    where: {
      userId_productId: { userId: customer2.id, productId: prodDuckyFull.id },
    },
    update: {},
    create: { userId: customer2.id, productId: prodDuckyFull.id },
  });

  await prisma.wishlistItem.upsert({
    where: {
      userId_productId: { userId: customer3.id, productId: prodAnnePro2.id },
    },
    update: {},
    create: { userId: customer3.id, productId: prodAnnePro2.id },
  });

  console.log(`   ✅  Created 5 wishlist items\n`);

  // ── 8. Orders ─────────────────────────────────────────────────────────────
  console.log('📦  Seeding orders...');

  const q3ProDefaultSwitchOptionId = await findDefaultSwitchOptionId(
    varQ3ProBlackRed.id,
  );
  const duckyDaybreakDefaultSwitchOptionId = await findDefaultSwitchOptionId(
    varDuckyDaybreakRed.id,
  );
  const tofu65DefaultSwitchOptionId = await findDefaultSwitchOptionId(
    varTofu65Silver.id,
  );
  const k8ProDefaultSwitchOptionId = await findDefaultSwitchOptionId(
    varK8ProGray.id,
  );

  // Order 1: Alice — DELIVERED via PayPal
  const order1 = await prisma.order.create({
    data: {
      orderCode: 'LK-DEMO-000001',
      userId: customer1.id,
      addressId: addr1.id,
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.PAYPAL,
      paymentStatus: PaymentStatus.PAID,
      subtotalAmount: 199.99,
      discountAmount: 0,
      shippingAmount: 9.99,
      totalAmount: 209.98,
      paypalOrderId: 'PAYID-L3ABCXYZ123456789',
      placedAt: daysAgo(26, 8, 30),
      ...buildOrderAddressSnapshot(addr1),
    },
  });

  const order1ItemQ3Pro = await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: prodQ3Pro.id,
      variantId: varQ3ProBlackRed.id,
      switchOptionId: q3ProDefaultSwitchOptionId,
      productName: prodQ3Pro.name,
      variantName: varQ3ProBlackRed.name,
      sku: varQ3ProBlackRed.sku,
      thumbnailUrl: prodQ3Pro.thumbnailUrl,
      unitPrice: 199.99,
      quantity: 1,
      subtotalAmount: 199.99,
    },
  });

  // Order 2: Bob — CONFIRMED via COD
  const order2 = await prisma.order.create({
    data: {
      orderCode: 'LK-DEMO-000002',
      userId: customer2.id,
      addressId: addr2.id,
      status: OrderStatus.CONFIRMED,
      paymentMethod: PaymentMethod.COD,
      paymentStatus: PaymentStatus.PENDING,
      subtotalAmount: 37.98,
      discountAmount: 0,
      shippingAmount: 5.99,
      totalAmount: 43.97,
      note: 'Please leave package at front door.',
      placedAt: daysAgo(19, 14, 0),
      ...buildOrderAddressSnapshot(addr2),
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: prodGateronYellow.id,
      variantId: varGateronYellow110.id,
      productName: prodGateronYellow.name,
      variantName: varGateronYellow110.name,
      sku: varGateronYellow110.sku,
      thumbnailUrl: prodGateronYellow.thumbnailUrl,
      unitPrice: 18.99,
      quantity: 2,
      subtotalAmount: 37.98,
    },
  });

  // Order 3: Carol — DELIVERED via PayPal, multiple items
  const order3 = await prisma.order.create({
    data: {
      orderCode: 'LK-DEMO-000003',
      userId: customer3.id,
      addressId: addr3.id,
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.PAYPAL,
      paymentStatus: PaymentStatus.PAID,
      subtotalAmount: 299.98,
      discountAmount: 10.0,
      shippingAmount: 0,
      totalAmount: 289.98,
      paypalOrderId: 'PAYID-M4DEFGHI987654321',
      trackingCode: 'UPS1Z999AA10123456784',
      placedAt: daysAgo(12, 9, 15),
      ...buildOrderAddressSnapshot(addr3),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order3.id,
        productId: prodDuckyOne3.id,
        variantId: varDuckyDaybreakRed.id,
        switchOptionId: duckyDaybreakDefaultSwitchOptionId,
        productName: prodDuckyOne3.name,
        variantName: varDuckyDaybreakRed.name,
        sku: varDuckyDaybreakRed.sku,
        thumbnailUrl: prodDuckyOne3.thumbnailUrl,
        unitPrice: 129.99,
        quantity: 1,
        subtotalAmount: 129.99,
      },
      {
        orderId: order3.id,
        productId: prodGMKNightCity.id,
        variantId: varGMKBaseKit.id,
        productName: prodGMKNightCity.name,
        variantName: varGMKBaseKit.name,
        sku: varGMKBaseKit.sku,
        thumbnailUrl: prodGMKNightCity.thumbnailUrl,
        unitPrice: 159.99,
        quantity: 1,
        subtotalAmount: 159.99,
      },
    ],
  });

  // Order 4: Alice — CANCELLED
  const order4 = await prisma.order.create({
    data: {
      orderCode: 'LK-DEMO-000004',
      userId: customer1.id,
      addressId: addr1.id,
      status: OrderStatus.CANCELLED,
      paymentMethod: PaymentMethod.PAYPAL,
      paymentStatus: PaymentStatus.FAILED,
      subtotalAmount: 169.0,
      discountAmount: 0,
      shippingAmount: 9.99,
      totalAmount: 178.99,
      paypalOrderId: 'PAYID-CANCELLED-000004',
      placedAt: daysAgo(8, 11, 0),
      ...buildOrderAddressSnapshot(addr1),
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order4.id,
      productId: prodTofu65.id,
      variantId: varTofu65Silver.id,
      switchOptionId: tofu65DefaultSwitchOptionId,
      productName: prodTofu65.name,
      variantName: varTofu65Silver.name,
      sku: varTofu65Silver.sku,
      thumbnailUrl: prodTofu65.thumbnailUrl,
      unitPrice: 169.0,
      quantity: 1,
      subtotalAmount: 169.0,
    },
  });

  // Order 5: Bob — PENDING
  const order5 = await prisma.order.create({
    data: {
      orderCode: 'LK-DEMO-000005',
      userId: customer2.id,
      addressId: addr2.id,
      status: OrderStatus.PENDING,
      paymentMethod: PaymentMethod.PAYPAL,
      paymentStatus: PaymentStatus.PENDING,
      subtotalAmount: 109.99,
      discountAmount: 0,
      shippingAmount: 9.99,
      totalAmount: 119.98,
      placedAt: daysAgo(2, 17, 45),
      ...buildOrderAddressSnapshot(addr2),
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order5.id,
      productId: prodK8Pro.id,
      variantId: varK8ProGray.id,
      switchOptionId: k8ProDefaultSwitchOptionId,
      productName: prodK8Pro.name,
      variantName: varK8ProGray.name,
      sku: varK8ProGray.sku,
      thumbnailUrl: prodK8Pro.thumbnailUrl,
      unitPrice: 109.99,
      quantity: 1,
      subtotalAmount: 109.99,
    },
  });

  const varQ1 = await prisma.productVariant.findUniqueOrThrow({
    where: { sku: 'KQ1-GRY-YLW' },
  });
  const varHolyPanda = await prisma.productVariant.findUniqueOrThrow({
    where: { sku: 'HP-35PK' },
  });
  const varKailhNavy = await prisma.productVariant.findUniqueOrThrow({
    where: { sku: 'KBN-36PK' },
  });
  const varDuckyFull = await prisma.productVariant.findUniqueOrThrow({
    where: { sku: 'D13-FULL-BLK-RED' },
  });
  const varDeskMat = await prisma.productVariant.findUniqueOrThrow({
    where: { sku: 'LKDM-MNT-XL' },
  });
  const q1DefaultSwitchOptionId = await findDefaultSwitchOptionId(varQ1.id);
  const duckyFullDefaultSwitchOptionId = await findDefaultSwitchOptionId(
    varDuckyFull.id,
  );

  // Order 6: Carol — DELIVERED (With newly seeded products)
  const order6 = await prisma.order.create({
    data: {
      orderCode: 'LK-DEMO-000006',
      userId: customer3.id,
      addressId: addr3.id,
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.PAYPAL,
      paymentStatus: PaymentStatus.PAID,
      subtotalAmount: 239.99,
      discountAmount: 0,
      shippingAmount: 0,
      totalAmount: 239.99,
      placedAt: daysAgo(4, 10, 0),
      ...buildOrderAddressSnapshot(addr3),
    },
  });

  const order6ItemQ1 = await prisma.orderItem.create({
    data: {
      orderId: order6.id,
      productId: prodQ1.id,
      variantId: varQ1.id,
      switchOptionId: q1DefaultSwitchOptionId,
      productName: prodQ1.name,
      variantName: varQ1.name,
      sku: varQ1.sku,
      thumbnailUrl: prodQ1.thumbnailUrl,
      unitPrice: 169.99,
      quantity: 1,
      subtotalAmount: 169.99,
    },
  });

  const order6ItemHolyPanda = await prisma.orderItem.create({
    data: {
      orderId: order6.id,
      productId: prodHolyPanda.id,
      variantId: varHolyPanda.id,
      productName: prodHolyPanda.name,
      variantName: varHolyPanda.name,
      sku: varHolyPanda.sku,
      thumbnailUrl: prodHolyPanda.thumbnailUrl,
      unitPrice: 35.0,
      quantity: 2,
      subtotalAmount: 70.0,
    },
  });

  const order7 = await prisma.order.create({
    data: {
      orderCode: 'LK-DEMO-000007',
      userId: customer2.id,
      addressId: addr2.id,
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.PAYPAL,
      paymentStatus: PaymentStatus.PAID,
      subtotalAmount: 144.98,
      discountAmount: 0,
      shippingAmount: 9.99,
      totalAmount: 154.97,
      paypalOrderId: 'PAYID-DEMO-000007',
      placedAt: daysAgo(1, 15, 20),
      ...buildOrderAddressSnapshot(addr2),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order7.id,
        productId: prodK8Pro.id,
        variantId: varK8ProGray.id,
        switchOptionId: k8ProDefaultSwitchOptionId,
        productName: prodK8Pro.name,
        variantName: varK8ProGray.name,
        sku: varK8ProGray.sku,
        thumbnailUrl: prodK8Pro.thumbnailUrl,
        unitPrice: 109.99,
        quantity: 1,
        subtotalAmount: 109.99,
      },
      {
        orderId: order7.id,
        productId: prodDeskMat.id,
        variantId: varDeskMat.id,
        productName: prodDeskMat.name,
        variantName: varDeskMat.name,
        sku: varDeskMat.sku,
        thumbnailUrl: prodDeskMat.thumbnailUrl,
        unitPrice: 34.99,
        quantity: 1,
        subtotalAmount: 34.99,
      },
    ],
  });

  const order8 = await prisma.order.create({
    data: {
      orderCode: 'LK-DEMO-000008',
      userId: customer1.id,
      addressId: addr1.id,
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.PAYPAL,
      paymentStatus: PaymentStatus.PAID,
      subtotalAmount: 239.0,
      discountAmount: 10.0,
      shippingAmount: 0,
      totalAmount: 229.0,
      paypalOrderId: 'PAYID-DEMO-000008',
      placedAt: daysAgo(16, 13, 10),
      ...buildOrderAddressSnapshot(addr1),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order8.id,
        productId: prodTofu65.id,
        variantId: varTofu65Silver.id,
        switchOptionId: tofu65DefaultSwitchOptionId,
        productName: prodTofu65.name,
        variantName: varTofu65Silver.name,
        sku: varTofu65Silver.sku,
        thumbnailUrl: prodTofu65.thumbnailUrl,
        unitPrice: 169.0,
        quantity: 1,
        subtotalAmount: 169.0,
      },
      {
        orderId: order8.id,
        productId: prodHolyPanda.id,
        variantId: varHolyPanda.id,
        productName: prodHolyPanda.name,
        variantName: varHolyPanda.name,
        sku: varHolyPanda.sku,
        thumbnailUrl: prodHolyPanda.thumbnailUrl,
        unitPrice: 35.0,
        quantity: 2,
        subtotalAmount: 70.0,
      },
    ],
  });

  const order9 = await prisma.order.create({
    data: {
      orderCode: 'LK-DEMO-000009',
      userId: customer2.id,
      addressId: addr2.id,
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.COD,
      paymentStatus: PaymentStatus.PAID,
      subtotalAmount: 158.98,
      discountAmount: 0,
      shippingAmount: 0,
      totalAmount: 158.98,
      placedAt: daysAgo(22, 16, 40),
      ...buildOrderAddressSnapshot(addr2),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order9.id,
        productId: prodDuckyFull.id,
        variantId: varDuckyFull.id,
        switchOptionId: duckyFullDefaultSwitchOptionId,
        productName: prodDuckyFull.name,
        variantName: varDuckyFull.name,
        sku: varDuckyFull.sku,
        thumbnailUrl: prodDuckyFull.thumbnailUrl,
        unitPrice: 139.99,
        quantity: 1,
        subtotalAmount: 139.99,
      },
      {
        orderId: order9.id,
        productId: prodGateronYellow.id,
        variantId: varGateronYellow110.id,
        productName: prodGateronYellow.name,
        variantName: varGateronYellow110.name,
        sku: varGateronYellow110.sku,
        thumbnailUrl: prodGateronYellow.thumbnailUrl,
        unitPrice: 18.99,
        quantity: 1,
        subtotalAmount: 18.99,
      },
    ],
  });

  const order10 = await prisma.order.create({
    data: {
      orderCode: 'LK-DEMO-000010',
      userId: customer3.id,
      addressId: addr3.id,
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.PAYPAL,
      paymentStatus: PaymentStatus.PAID,
      subtotalAmount: 96.0,
      discountAmount: 0,
      shippingAmount: 5.99,
      totalAmount: 101.99,
      paypalOrderId: 'PAYID-DEMO-000010',
      placedAt: daysAgo(45, 10, 25),
      ...buildOrderAddressSnapshot(addr3),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order10.id,
        productId: prodKailhNavy.id,
        variantId: varKailhNavy.id,
        productName: prodKailhNavy.name,
        variantName: varKailhNavy.name,
        sku: varKailhNavy.sku,
        thumbnailUrl: prodKailhNavy.thumbnailUrl,
        unitPrice: 32.0,
        quantity: 3,
        subtotalAmount: 96.0,
      },
    ],
  });

  console.log(`   ✅  Created 10 orders with 7 delivered orders\n`);

  // ── 9. Reviews ────────────────────────────────────────────────────────────
  console.log('⭐  Seeding reviews...');

  await prisma.review.createMany({
    data: [
      {
        userId: customer1.id,
        productId: prodQ3Pro.id,
        orderItemId: order1ItemQ3Pro.id,
        rating: 5,
        title: 'Best keyboard I have ever owned',
        content:
          'The Q3 Pro is an absolute dream to type on. The gasket mount gives it a satisfying bouncy feel, and the wireless is rock-solid. QMK support is a huge bonus. Worth every penny.',
      },
      {
        userId: customer2.id,
        productId: prodGateronYellow.id,
        rating: 5,
        title: 'Butter-smooth linears',
        content:
          'These switches are incredibly smooth right out of the box. Lubing them makes them even better. Perfect for my TOFU65 build.',
      },
      {
        userId: customer3.id,
        productId: prodDuckyOne3.id,
        rating: 4,
        title: 'Great compact keyboard',
        content:
          'Love the 65% form factor. Build quality is top-notch and the PBT keycaps feel excellent. Docked one star as software could be improved.',
      },
      {
        userId: customer1.id,
        productId: prodGMKNightCity.id,
        rating: 5,
        title: 'Gorgeous keycaps',
        content:
          'The neon colorways look absolutely stunning under RGB lighting. Legends are crisp and the ABS keeps that shine perfectly. Worth the wait.',
      },
      {
        userId: customer2.id,
        productId: prodK8Pro.id,
        rating: 4,
        title: 'Solid entry-level enthusiast board',
        content:
          'Great value for money. The wireless works well and QMK support is fantastic. Build quality is slightly below the Q series but still very good.',
      },
      {
        userId: customer3.id,
        productId: prodHolyPanda.id,
        orderItemId: order6ItemHolyPanda.id,
        rating: 5,
        title: 'The classic tactile experience',
        content:
          'Holy Pandas are legendary for a reason. The tactile bump is incredible and the sound profile is deeply satisfying. A must-have for tactile lovers.',
      },
      {
        userId: customer3.id,
        productId: prodQ1.id,
        orderItemId: order6ItemQ1.id,
        rating: 5,
        title: 'Amazing custom pre-built',
        content:
          'The Keychron Q1 feels and sounds premium right out of the box. The aluminum chassis is heavy and the gasket mount provides a very comfortable typing experience.',
      },
    ],
    skipDuplicates: true,
  });

  console.log(`   ✅  Created 7 reviews\n`);

  // ─────────────────────────────────────────────────────────────────────────
  console.log('✨  Seed completed successfully!\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('  Test Accounts');
  console.log('═══════════════════════════════════════════════════');
  console.log('  ADMIN   admin@luxekeys.com       Admin@123456');
  console.log('  USER 1  alice.johnson@example.com  Alice@123456');
  console.log('  USER 2  bob.smith@example.com      Bob@123456');
  console.log('  USER 3  carol.lee@example.com      Carol@123456');
  console.log('═══════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
