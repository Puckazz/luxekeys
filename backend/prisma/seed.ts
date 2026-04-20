/* eslint-disable @typescript-eslint/no-require-imports */
// Load .env FIRST — must use require() so it executes before any imported module
// (ESM import statements are hoisted before top-level code)
const dotenv = require('dotenv') as typeof import('dotenv');
const path = require('path') as typeof import('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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
} from '../src/generated/prisma';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Simple SHA-256 hash (for testing only — use bcrypt in production) */
function hashPassword(plain: string): string {
  return crypto.createHash('sha256').update(plain).digest('hex');
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Starting seed...\n');

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
      line1: '742 Evergreen Terrace',
      ward: 'Inner Sunset',
      district: 'San Francisco County',
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
      line1: '1600 Amphitheatre Pkwy',
      line2: 'Suite 200',
      district: 'Los Angeles County',
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
      line1: '233 S Wacker Dr',
      ward: 'Loop',
      district: 'Cook County',
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
      logoUrl: 'https://cdn.luxekeys.com/brands/keychron.svg',
      isActive: true,
    },
  });

  const brandDucky = await prisma.brand.upsert({
    where: { slug: 'ducky' },
    update: {},
    create: {
      name: 'Ducky',
      slug: 'ducky',
      logoUrl: 'https://cdn.luxekeys.com/brands/ducky.svg',
      isActive: true,
    },
  });

  const brandGMK = await prisma.brand.upsert({
    where: { slug: 'gmk' },
    update: {},
    create: {
      name: 'GMK',
      slug: 'gmk',
      logoUrl: 'https://cdn.luxekeys.com/brands/gmk.svg',
      isActive: true,
    },
  });

  const brandZMK = await prisma.brand.upsert({
    where: { slug: 'zmk' },
    update: {},
    create: {
      name: 'ZMK / Gateron',
      slug: 'zmk',
      logoUrl: 'https://cdn.luxekeys.com/brands/zmk.svg',
      isActive: true,
    },
  });

  const brandKBDfans = await prisma.brand.upsert({
    where: { slug: 'kbdfans' },
    update: {},
    create: {
      name: 'KBDfans',
      slug: 'kbdfans',
      logoUrl: 'https://cdn.luxekeys.com/brands/kbdfans.svg',
      isActive: true,
    },
  });

  console.log(`   ✅  Created ${5} brands\n`);

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

  console.log(`   ✅  Created ${10} categories\n`);

  // ── 5. Products ───────────────────────────────────────────────────────────
  console.log('📦  Seeding products...');

  // ── Product 1: Keychron Q3 Pro ────────────────────────────────────────────
  const prodQ3Pro = await prisma.product.upsert({
    where: { slug: 'keychron-q3-pro-tkl' },
    update: {},
    create: {
      name: 'Keychron Q3 Pro TKL',
      slug: 'keychron-q3-pro-tkl',
      type: ProductType.KEYBOARD,
      status: ProductStatus.ACTIVE,
      brandId: brandKeychron.id,
      categoryId: catTKL.id,
      basePrice: 199.99,
      compareAtPrice: 229.99,
      thumbnailUrl: 'https://cdn.luxekeys.com/products/q3-pro/thumb.jpg',
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
        url: 'https://cdn.luxekeys.com/products/q3-pro/gallery-1.jpg',
        altText: 'Q3 Pro front view',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        productId: prodQ3Pro.id,
        url: 'https://cdn.luxekeys.com/products/q3-pro/gallery-2.jpg',
        altText: 'Q3 Pro side view',
        sortOrder: 2,
      },
      {
        productId: prodQ3Pro.id,
        url: 'https://cdn.luxekeys.com/products/q3-pro/gallery-3.jpg',
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
      name: 'Carbon Black / Red Switch (Hot-swap)',
      price: 199.99,
      compareAtPrice: 229.99,
      color: 'Carbon Black',
      layout: 'TKL',
      switchType: 'Keychron Red (Linear)',
      connectivity: 'Bluetooth + USB-C',
      stock: 42,
      isDefault: true,
      isActive: true,
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'KQ3P-WHT-BRN-HS' },
    update: {},
    create: {
      productId: prodQ3Pro.id,
      sku: 'KQ3P-WHT-BRN-HS',
      name: 'Off-White / Brown Switch (Hot-swap)',
      price: 199.99,
      compareAtPrice: 229.99,
      color: 'Off-White',
      layout: 'TKL',
      switchType: 'Keychron Brown (Tactile)',
      connectivity: 'Bluetooth + USB-C',
      stock: 28,
      isDefault: false,
      isActive: true,
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'KQ3P-NVY-BLU-HS' },
    update: {},
    create: {
      productId: prodQ3Pro.id,
      sku: 'KQ3P-NVY-BLU-HS',
      name: 'Navy Blue / Blue Switch (Hot-swap)',
      price: 199.99,
      color: 'Navy Blue',
      layout: 'TKL',
      switchType: 'Keychron Blue (Clicky)',
      connectivity: 'Bluetooth + USB-C',
      stock: 15,
      isDefault: false,
      isActive: true,
    },
  });

  // ── Product 2: Ducky One 3 SF ─────────────────────────────────────────────
  const prodDuckyOne3 = await prisma.product.upsert({
    where: { slug: 'ducky-one-3-sf-65' },
    update: {},
    create: {
      name: 'Ducky One 3 SF 65%',
      slug: 'ducky-one-3-sf-65',
      type: ProductType.KEYBOARD,
      status: ProductStatus.ACTIVE,
      brandId: brandDucky.id,
      categoryId: cat75.id,
      basePrice: 129.99,
      compareAtPrice: 149.99,
      thumbnailUrl: 'https://cdn.luxekeys.com/products/ducky-one3-sf/thumb.jpg',
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
        url: 'https://cdn.luxekeys.com/products/ducky-one3-sf/gallery-1.jpg',
        altText: 'Ducky One 3 SF Daybreak',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        productId: prodDuckyOne3.id,
        url: 'https://cdn.luxekeys.com/products/ducky-one3-sf/gallery-2.jpg',
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
      name: 'Daybreak / Cherry MX Red',
      price: 129.99,
      compareAtPrice: 149.99,
      color: 'Daybreak',
      layout: '65%',
      switchType: 'Cherry MX Red (Linear)',
      connectivity: 'USB-C',
      stock: 55,
      isDefault: true,
      isActive: true,
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'DUCK-ONE3-FJ-BLU' },
    update: {},
    create: {
      productId: prodDuckyOne3.id,
      sku: 'DUCK-ONE3-FJ-BLU',
      name: 'Fuji / Cherry MX Blue',
      price: 129.99,
      compareAtPrice: 149.99,
      color: 'Fuji',
      layout: '65%',
      switchType: 'Cherry MX Blue (Clicky)',
      connectivity: 'USB-C',
      stock: 30,
      isDefault: false,
      isActive: true,
    },
  });

  // ── Product 3: Gateron G Pro 3.0 Yellow (Switches) ────────────────────────
  const prodGateronYellow = await prisma.product.upsert({
    where: { slug: 'gateron-g-pro-3-yellow-linear' },
    update: {},
    create: {
      name: 'Gateron G Pro 3.0 Yellow Linear Switches',
      slug: 'gateron-g-pro-3-yellow-linear',
      type: ProductType.SWITCH,
      status: ProductStatus.ACTIVE,
      brandId: brandZMK.id,
      categoryId: catLinearSwitches.id,
      basePrice: 18.99,
      thumbnailUrl:
        'https://cdn.luxekeys.com/products/gateron-yellow/thumb.jpg',
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
        url: 'https://cdn.luxekeys.com/products/gateron-yellow/gallery-1.jpg',
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
      stock: 500,
      switchType: 'Linear',
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
      stock: 200,
      switchType: 'Linear',
      isDefault: true,
      isActive: true,
    },
  });

  // ── Product 4: GMK NightCity Keycaps ─────────────────────────────────────
  const prodGMKNightCity = await prisma.product.upsert({
    where: { slug: 'gmk-nightcity-keycaps' },
    update: {},
    create: {
      name: 'GMK NightCity Keycaps',
      slug: 'gmk-nightcity-keycaps',
      type: ProductType.KEYCAP,
      status: ProductStatus.ACTIVE,
      brandId: brandGMK.id,
      categoryId: catKeycaps.id,
      basePrice: 159.99,
      compareAtPrice: 185.0,
      thumbnailUrl: 'https://cdn.luxekeys.com/products/gmk-nightcity/thumb.jpg',
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
        url: 'https://cdn.luxekeys.com/products/gmk-nightcity/gallery-1.jpg',
        altText: 'GMK NightCity base kit',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        productId: prodGMKNightCity.id,
        url: 'https://cdn.luxekeys.com/products/gmk-nightcity/gallery-2.jpg',
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
      stock: 60,
      isDefault: false,
      isActive: true,
    },
  });

  // ── Product 5: KBDfans TOFU65 Barebones Kit ───────────────────────────────
  const prodTofu65 = await prisma.product.upsert({
    where: { slug: 'kbdfans-tofu65-barebones' },
    update: {},
    create: {
      name: 'KBDfans TOFU65 Barebones Kit',
      slug: 'kbdfans-tofu65-barebones',
      type: ProductType.BAREBONES_KIT,
      status: ProductStatus.ACTIVE,
      brandId: brandKBDfans.id,
      categoryId: cat75.id,
      basePrice: 169.0,
      compareAtPrice: 199.0,
      thumbnailUrl: 'https://cdn.luxekeys.com/products/tofu65/thumb.jpg',
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
        url: 'https://cdn.luxekeys.com/products/tofu65/gallery-1.jpg',
        altText: 'TOFU65 Silver',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        productId: prodTofu65.id,
        url: 'https://cdn.luxekeys.com/products/tofu65/gallery-2.jpg',
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
    update: {},
    create: {
      name: 'Keychron K8 Pro TKL Wireless',
      slug: 'keychron-k8-pro-tkl-wireless',
      type: ProductType.KEYBOARD,
      status: ProductStatus.ACTIVE,
      brandId: brandKeychron.id,
      categoryId: catTKL.id,
      basePrice: 109.99,
      compareAtPrice: 129.99,
      thumbnailUrl: 'https://cdn.luxekeys.com/products/k8-pro/thumb.jpg',
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
        url: 'https://cdn.luxekeys.com/products/k8-pro/gallery-1.jpg',
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
      name: 'Space Gray / Red Switch',
      price: 109.99,
      compareAtPrice: 129.99,
      color: 'Space Gray',
      layout: 'TKL',
      switchType: 'Keychron Red (Linear)',
      connectivity: 'Bluetooth + USB-C',
      stock: 60,
      isDefault: true,
      isActive: true,
    },
  });

  // ── Product 7: Desk Mat (Accessory) ──────────────────────────────────────
  const prodDeskMat = await prisma.product.upsert({
    where: { slug: 'luxekeys-xl-desk-mat-midnight' },
    update: {},
    create: {
      name: 'LuxeKeys XL Desk Mat — Midnight',
      slug: 'luxekeys-xl-desk-mat-midnight',
      type: ProductType.ACCESSORY,
      status: ProductStatus.ACTIVE,
      categoryId: catAccessories.id,
      basePrice: 34.99,
      thumbnailUrl:
        'https://cdn.luxekeys.com/products/desk-mat-midnight/thumb.jpg',
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
        url: 'https://cdn.luxekeys.com/products/desk-mat-midnight/gallery-1.jpg',
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

  console.log(`   ✅  Created 7 products with variants, specs, and images\n`);

  // ── 6. Carts ──────────────────────────────────────────────────────────────
  console.log('🛒  Seeding carts...');

  const cartAlice = await prisma.cart.upsert({
    where: { userId: customer1.id },
    update: {},
    create: { userId: customer1.id },
  });

  await prisma.cartItem.upsert({
    where: {
      cartId_variantId: {
        cartId: cartAlice.id,
        variantId: varQ3ProBlackRed.id,
      },
    },
    update: { quantity: 1 },
    create: {
      cartId: cartAlice.id,
      variantId: varQ3ProBlackRed.id,
      quantity: 1,
    },
  });

  await prisma.cartItem.upsert({
    where: {
      cartId_variantId: { cartId: cartAlice.id, variantId: varGMKBaseKit.id },
    },
    update: { quantity: 1 },
    create: { cartId: cartAlice.id, variantId: varGMKBaseKit.id, quantity: 1 },
  });

  const cartBob = await prisma.cart.upsert({
    where: { userId: customer2.id },
    update: {},
    create: { userId: customer2.id },
  });

  await prisma.cartItem.upsert({
    where: {
      cartId_variantId: {
        cartId: cartBob.id,
        variantId: varGateronYellow110.id,
      },
    },
    update: { quantity: 2 },
    create: {
      cartId: cartBob.id,
      variantId: varGateronYellow110.id,
      quantity: 2,
    },
  });

  console.log(`   ✅  Created carts for Alice and Bob\n`);

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

  console.log(`   ✅  Created 3 wishlist items\n`);

  // ── 8. Orders ─────────────────────────────────────────────────────────────
  console.log('📦  Seeding orders...');

  // Order 1: Alice — DELIVERED via PayPal
  const order1 = await prisma.order.create({
    data: {
      orderCode: 'LK-2024-000001',
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
      placedAt: new Date('2024-11-15T08:30:00Z'),
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: prodQ3Pro.id,
      variantId: varQ3ProBlackRed.id,
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
      orderCode: 'LK-2024-000002',
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
      placedAt: new Date('2024-12-01T14:00:00Z'),
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

  // Order 3: Carol — SHIPPING via PayPal, multiple items
  const order3 = await prisma.order.create({
    data: {
      orderCode: 'LK-2025-000003',
      userId: customer3.id,
      addressId: addr3.id,
      status: OrderStatus.SHIPPING,
      paymentMethod: PaymentMethod.PAYPAL,
      paymentStatus: PaymentStatus.PAID,
      subtotalAmount: 299.98,
      discountAmount: 10.0,
      shippingAmount: 0,
      totalAmount: 289.98,
      paypalOrderId: 'PAYID-M4DEFGHI987654321',
      trackingCode: 'UPS1Z999AA10123456784',
      placedAt: new Date('2025-01-10T09:15:00Z'),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order3.id,
        productId: prodDuckyOne3.id,
        variantId: varDuckyDaybreakRed.id,
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
      orderCode: 'LK-2025-000004',
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
      placedAt: new Date('2025-02-05T11:00:00Z'),
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order4.id,
      productId: prodTofu65.id,
      variantId: varTofu65Silver.id,
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
      orderCode: 'LK-2025-000005',
      userId: customer2.id,
      addressId: addr2.id,
      status: OrderStatus.PENDING,
      paymentMethod: PaymentMethod.PAYPAL,
      paymentStatus: PaymentStatus.PENDING,
      subtotalAmount: 109.99,
      discountAmount: 0,
      shippingAmount: 9.99,
      totalAmount: 119.98,
      placedAt: new Date('2025-03-20T17:45:00Z'),
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order5.id,
      productId: prodK8Pro.id,
      variantId: varK8ProGray.id,
      productName: prodK8Pro.name,
      variantName: varK8ProGray.name,
      sku: varK8ProGray.sku,
      thumbnailUrl: prodK8Pro.thumbnailUrl,
      unitPrice: 109.99,
      quantity: 1,
      subtotalAmount: 109.99,
    },
  });

  console.log(`   ✅  Created 5 orders across all statuses\n`);

  // ── 9. Reviews ────────────────────────────────────────────────────────────
  console.log('⭐  Seeding reviews...');

  await prisma.review.createMany({
    data: [
      {
        userId: customer1.id,
        productId: prodQ3Pro.id,
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
    ],
    skipDuplicates: true,
  });

  console.log(`   ✅  Created 5 reviews\n`);

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
