import {
  ProductCaseMaterial,
  ProductDetail,
  ProductFeature,
  ProductLayout,
  ProductListItem,
  ProductSortOption,
  ProductSwitchType,
} from '@/features/shop/types';

export const PRODUCT_LAYOUT_OPTIONS: ProductLayout[] = [
  '60%',
  '65%',
  '75%',
  'TKL',
  '100%',
  'Split',
];

export const PRODUCT_SWITCH_TYPE_OPTIONS: ProductSwitchType[] = [
  'Linear',
  'Tactile',
  'Clicky',
];

export const PRODUCT_FEATURE_OPTIONS: ProductFeature[] = [
  'Hotswap PCB',
  'RGB Lighting',
  'QMK/VIA Support',
  'Wireless',
  'Low Profile',
  'LCD Screen',
];

export const PRODUCT_CASE_MATERIAL_OPTIONS: ProductCaseMaterial[] = [
  'Aluminum',
  'Polycarbonate',
  'ABS Plastic',
  'Carbon Fiber',
];

export const PRODUCT_SORT_OPTIONS: Array<{
  value: ProductSortOption;
  label: string;
}> = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price', label: 'Price: Low to High' },
];

export const PRODUCT_LIST_PAGE_SIZE = 6;

export const productsCatalog: ProductListItem[] = [
  {
    id: 'mk-90-pro',
    slug: 'mk-90-pro',
    name: 'MK-90 Pro Gasket Mount',
    brand: 'MK-90',
    description:
      'Premium 75% gasket-mounted keyboard engineered for deep acoustics and fast response.',
    price: 349,
    image:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1400&q=80',
    badge: 'in-stock',
    layout: '75%',
    switchType: 'Linear',
    features: ['Hotswap PCB', 'QMK/VIA Support', 'Wireless', 'RGB Lighting'],
    caseMaterial: 'Aluminum',
    tags: ['Premium Edition', 'Gasket', 'Acoustic Tuned'],
    rating: 4.9,
    popularity: 100,
    createdAt: '2026-03-20',
  },
  {
    id: 'keychron-q1-pro',
    slug: 'keychron-q1-pro',
    name: 'Q1 Pro Wireless',
    brand: 'Keychron',
    description:
      '75% aluminum wireless mechanical keyboard with QMK/VIA support.',
    price: 199,
    image:
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80',
    badge: 'new',
    layout: '75%',
    switchType: 'Tactile',
    features: ['Hotswap PCB', 'QMK/VIA Support', 'Wireless'],
    caseMaterial: 'Aluminum',
    tags: ['Aluminum', 'Hotswap', 'BT 5.1'],
    rating: 4.8,
    popularity: 97,
    createdAt: '2026-02-10',
  },
  {
    id: 'mode-sixtyfive',
    slug: 'mode-sixtyfive',
    name: 'Mode SixtyFive',
    brand: 'Mode Designs',
    description:
      'A customizable 65% mechanical keyboard tuned for premium acoustics.',
    price: 299,
    image:
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=80',
    badge: 'in-stock',
    layout: '65%',
    switchType: 'Linear',
    features: ['Hotswap PCB', 'QMK/VIA Support'],
    caseMaterial: 'Aluminum',
    tags: ['Premium', 'ISO/ANSI', 'Copper'],
    rating: 4.9,
    popularity: 95,
    createdAt: '2025-12-18',
  },
  {
    id: 'nuphy-air75-v2',
    slug: 'nuphy-air75-v2',
    name: 'Air75 V2',
    brand: 'NuPhy',
    description: 'Ultra-slim 75% wireless keyboard with low profile switches.',
    price: 129,
    image:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
    badge: 'limited',
    layout: '75%',
    switchType: 'Linear',
    features: ['Wireless', 'Low Profile', 'RGB Lighting'],
    caseMaterial: 'ABS Plastic',
    tags: ['Low Profile', '4000mAh'],
    rating: 4.6,
    popularity: 90,
    createdAt: '2026-01-23',
  },
  {
    id: 'ducky-one-3-tkl',
    slug: 'ducky-one-3-tkl',
    name: 'One 3 TKL',
    brand: 'Ducky',
    description:
      'Reliable tenkeyless board with smooth acoustics and sturdy build.',
    price: 109,
    image:
      'https://images.unsplash.com/photo-1613141411244-0e4ac259d217?auto=format&fit=crop&w=1200&q=80',
    layout: 'TKL',
    switchType: 'Clicky',
    features: ['RGB Lighting'],
    caseMaterial: 'ABS Plastic',
    tags: ['PBT Caps', 'Cherry MX'],
    rating: 4.5,
    popularity: 84,
    createdAt: '2025-10-01',
  },
  {
    id: 'angry-miao-cyberboard-r4',
    slug: 'angry-miao-cyberboard-r4',
    name: 'Cyberboard R4',
    brand: 'Angry Miao',
    description: 'Futuristic keyboard with animated rear LED matrix shell.',
    price: 650,
    image:
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80',
    layout: '75%',
    switchType: 'Linear',
    features: ['Wireless', 'LED Matrix', 'RGB Lighting'],
    caseMaterial: 'Carbon Fiber',
    tags: ['LED Matrix', 'Wireless'],
    rating: 4.7,
    popularity: 82,
    createdAt: '2025-11-28',
  },
  {
    id: 'wuque-zoom75',
    slug: 'wuque-zoom75',
    name: 'Zoom75',
    brand: 'Wuque Studio',
    description: 'Modular 75% keyboard with optional screen and knob modules.',
    price: 179,
    image:
      'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=1200&q=80',
    layout: '75%',
    switchType: 'Tactile',
    features: ['Hotswap PCB', 'LCD Screen', 'QMK/VIA Support'],
    caseMaterial: 'Aluminum',
    tags: ['LCD Screen', 'Gasket'],
    rating: 4.8,
    popularity: 93,
    createdAt: '2026-02-05',
  },
  {
    id: 'tofu60-redux',
    slug: 'tofu60-redux',
    name: 'Tofu60 Redux',
    brand: 'KBDfans',
    description: 'Classic 60% enthusiast board with refined mounting options.',
    price: 159,
    image:
      'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1200&q=80',
    layout: '60%',
    switchType: 'Linear',
    features: ['Hotswap PCB', 'QMK/VIA Support'],
    caseMaterial: 'Aluminum',
    tags: ['60%', 'ANSI'],
    rating: 4.6,
    popularity: 88,
    createdAt: '2025-09-11',
  },
  {
    id: 'neo65',
    slug: 'neo65',
    name: 'Neo65',
    brand: 'QwertyKeys',
    description:
      'Value-focused 65% keyboard kit with excellent tuning potential.',
    price: 139,
    image:
      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=1200&q=80',
    layout: '65%',
    switchType: 'Tactile',
    features: ['Hotswap PCB', 'QMK/VIA Support'],
    caseMaterial: 'Polycarbonate',
    tags: ['Budget Premium', 'Gasket'],
    rating: 4.7,
    popularity: 92,
    createdAt: '2026-01-12',
  },
  {
    id: 'monsgeek-m1w',
    slug: 'monsgeek-m1w',
    name: 'M1W V3',
    brand: 'MonsGeek',
    description: 'Wireless 75% aluminum board with tri-mode connectivity.',
    price: 149,
    image:
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80',
    layout: '75%',
    switchType: 'Linear',
    features: ['Wireless', 'Hotswap PCB', 'RGB Lighting'],
    caseMaterial: 'Aluminum',
    tags: ['Tri-mode', 'RGB'],
    rating: 4.5,
    popularity: 80,
    createdAt: '2025-08-30',
  },
  {
    id: 'akko-5075b-plus',
    slug: 'akko-5075b-plus',
    name: '5075B Plus',
    brand: 'Akko',
    description:
      'Compact 75% board with vibrant RGB and multi-device wireless.',
    price: 99,
    image:
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=1200&q=80',
    layout: '75%',
    switchType: 'Clicky',
    features: ['Wireless', 'RGB Lighting'],
    caseMaterial: 'ABS Plastic',
    tags: ['Budget', 'RGB'],
    rating: 4.4,
    popularity: 74,
    createdAt: '2025-07-02',
  },
  {
    id: 'lofree-flow',
    slug: 'lofree-flow',
    name: 'Flow',
    brand: 'Lofree',
    description: 'Low-profile keyboard with smooth travel and quiet operation.',
    price: 169,
    image:
      'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?auto=format&fit=crop&w=1200&q=80',
    layout: '75%',
    switchType: 'Linear',
    features: ['Wireless', 'Low Profile'],
    caseMaterial: 'Aluminum',
    tags: ['Low Profile', 'Mac/Win'],
    rating: 4.6,
    popularity: 81,
    createdAt: '2026-03-01',
  },
  {
    id: 'epomaker-th80-pro',
    slug: 'epomaker-th80-pro',
    name: 'TH80 Pro',
    brand: 'Epomaker',
    description: 'Affordable 75% board with premium feature set and tri-mode.',
    price: 89,
    image:
      'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
    layout: '75%',
    switchType: 'Tactile',
    features: ['Wireless', 'Hotswap PCB', 'RGB Lighting'],
    caseMaterial: 'ABS Plastic',
    tags: ['Value', 'Hot Swap'],
    rating: 4.3,
    popularity: 76,
    createdAt: '2025-06-14',
  },
  {
    id: 'wooting-60he',
    slug: 'wooting-60he',
    name: '60HE',
    brand: 'Wooting',
    description: 'Hall effect analog keyboard with rapid trigger performance.',
    price: 174,
    image:
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80',
    badge: 'in-stock',
    layout: '60%',
    switchType: 'Linear',
    features: ['RGB Lighting', 'QMK/VIA Support'],
    caseMaterial: 'ABS Plastic',
    tags: ['Hall Effect', 'Esports'],
    rating: 4.9,
    popularity: 99,
    createdAt: '2026-03-09',
  },
  {
    id: 'meletrix-boog75',
    slug: 'meletrix-boog75',
    name: 'Boog75',
    brand: 'Meletrix',
    description:
      'All-in-one 75% board with magnetic switches and premium sound.',
    price: 229,
    image:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
    layout: '75%',
    switchType: 'Linear',
    features: ['Wireless', 'Hotswap PCB', 'RGB Lighting'],
    caseMaterial: 'Aluminum',
    tags: ['Magnetic', 'Gasket'],
    rating: 4.8,
    popularity: 94,
    createdAt: '2026-02-19',
  },
  {
    id: 'keydous-nj80',
    slug: 'keydous-nj80',
    name: 'NJ80',
    brand: 'Keydous',
    description: 'Compact wireless 75% board with knob and foam kit included.',
    price: 109,
    image:
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80',
    layout: '75%',
    switchType: 'Tactile',
    features: ['Wireless', 'Hotswap PCB'],
    caseMaterial: 'Polycarbonate',
    tags: ['Knob', 'Wireless'],
    rating: 4.2,
    popularity: 69,
    createdAt: '2025-05-30',
  },
  {
    id: 'leobog-hi75',
    slug: 'leobog-hi75',
    name: 'Hi75',
    brand: 'Leobog',
    description: 'Value gasket 75% aluminum board with bright per-key RGB.',
    price: 119,
    image:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    layout: '75%',
    switchType: 'Clicky',
    features: ['Hotswap PCB', 'RGB Lighting'],
    caseMaterial: 'Aluminum',
    tags: ['RGB', 'Aluminum'],
    rating: 4.3,
    popularity: 72,
    createdAt: '2025-04-16',
  },
  {
    id: 'melgeek-mojo68',
    slug: 'melgeek-mojo68',
    name: 'Mojo68',
    brand: 'MelGeek',
    description: 'Transparent polycarbonate 65% board with playful styling.',
    price: 169,
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    layout: '65%',
    switchType: 'Tactile',
    features: ['Wireless', 'RGB Lighting'],
    caseMaterial: 'Polycarbonate',
    tags: ['Transparent', 'Wireless'],
    rating: 4.4,
    popularity: 71,
    createdAt: '2025-03-18',
  },
  {
    id: 'glorious-gmmk-pro',
    slug: 'glorious-gmmk-pro',
    name: 'GMMK Pro',
    brand: 'Glorious',
    description:
      'Enthusiast-grade 75% board with rotary knob and aluminum body.',
    price: 179,
    image:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
    layout: '75%',
    switchType: 'Linear',
    features: ['Hotswap PCB', 'QMK/VIA Support', 'RGB Lighting'],
    caseMaterial: 'Aluminum',
    tags: ['Knob', 'QMK'],
    rating: 4.5,
    popularity: 79,
    createdAt: '2025-02-11',
  },
  {
    id: 'varmilo-vb87m',
    slug: 'varmilo-vb87m',
    name: 'VB87M',
    brand: 'Varmilo',
    description: 'Premium TKL board with focused typing feel and clean sound.',
    price: 149,
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    layout: 'TKL',
    switchType: 'Tactile',
    features: ['Wireless'],
    caseMaterial: 'ABS Plastic',
    tags: ['TKL', 'Wireless'],
    rating: 4.5,
    popularity: 77,
    createdAt: '2025-01-22',
  },
  {
    id: 'rk-r100',
    slug: 'rk-r100',
    name: 'R100',
    brand: 'Royal Kludge',
    description: 'Full-size wireless keyboard with dedicated numpad and RGB.',
    price: 79,
    image:
      'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=1200&q=80',
    layout: '100%',
    switchType: 'Clicky',
    features: ['Wireless', 'RGB Lighting'],
    caseMaterial: 'ABS Plastic',
    tags: ['Full Size', 'Budget'],
    rating: 4.1,
    popularity: 63,
    createdAt: '2024-11-06',
  },
  {
    id: 'keychron-k8-pro',
    slug: 'keychron-k8-pro',
    name: 'K8 Pro',
    brand: 'Keychron',
    description: 'Wireless TKL with QMK/VIA and hotswap switch support.',
    price: 109,
    image:
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80',
    layout: 'TKL',
    switchType: 'Linear',
    features: ['Wireless', 'Hotswap PCB', 'QMK/VIA Support'],
    caseMaterial: 'ABS Plastic',
    tags: ['TKL', 'QMK'],
    rating: 4.6,
    popularity: 86,
    createdAt: '2025-12-03',
  },
  {
    id: 'ergodox-ez',
    slug: 'ergodox-ez',
    name: 'ErgoDox EZ',
    brand: 'ZSA',
    description: 'Split ergonomic keyboard with extensive programmability.',
    price: 325,
    image:
      'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80',
    layout: 'Split',
    switchType: 'Tactile',
    features: ['QMK/VIA Support', 'Hotswap PCB'],
    caseMaterial: 'ABS Plastic',
    tags: ['Ergonomic', 'Split'],
    rating: 4.7,
    popularity: 70,
    createdAt: '2024-12-27',
  },
  {
    id: 'moonlander-mark-i',
    slug: 'moonlander-mark-i',
    name: 'Moonlander Mark I',
    brand: 'ZSA',
    description: 'Portable split ergonomic keyboard with tenting system.',
    price: 365,
    image:
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
    layout: 'Split',
    switchType: 'Linear',
    features: ['QMK/VIA Support', 'Hotswap PCB'],
    caseMaterial: 'ABS Plastic',
    tags: ['Portable', 'Split'],
    rating: 4.8,
    popularity: 73,
    createdAt: '2025-08-08',
  },
  {
    id: 'zoom98',
    slug: 'zoom98',
    name: 'Zoom98',
    brand: 'Wuque Studio',
    description: 'Full-size enthusiast board with screen and wireless support.',
    price: 239,
    image:
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80',
    layout: '100%',
    switchType: 'Tactile',
    features: ['Wireless', 'LCD Screen', 'Hotswap PCB'],
    caseMaterial: 'Aluminum',
    tags: ['Full Size', 'LCD'],
    rating: 4.6,
    popularity: 78,
    createdAt: '2026-02-28',
  },
  {
    id: 'cidoo-v87',
    slug: 'cidoo-v87',
    name: 'V87',
    brand: 'CIDOO',
    description:
      'TKL with gasket structure, knob, and premium dampening layers.',
    price: 129,
    image:
      'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=1200&q=80',
    layout: 'TKL',
    switchType: 'Linear',
    features: ['Hotswap PCB', 'RGB Lighting'],
    caseMaterial: 'Aluminum',
    tags: ['Knob', 'TKL'],
    rating: 4.4,
    popularity: 67,
    createdAt: '2025-10-23',
  },
];

const DETAIL_GALLERY_POOL = [
  'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1613141411244-0e4ac259d217?auto=format&fit=crop&w=1400&q=80',
];

const REVIEW_AUTHOR_POOL = [
  'Alex Rivers',
  'Sarah Chen',
  'Marcus Lane',
  'Kim Tran',
  'Noah Patel',
  'Mia Hoang',
];

const REVIEW_TIME_POOL = [
  '2 days ago',
  '1 week ago',
  '4 days ago',
  '2 weeks ago',
];

const COLOR_PRESETS = [
  'Obsidian Black',
  'Arctic White',
  'Deep Sea Blue',
  'Graphite Gray',
];

const buildGallery = (product: ProductListItem, seed: number) => {
  return [product.image, ...DETAIL_GALLERY_POOL]
    .slice(seed % 3, (seed % 3) + 5)
    .map((src, index) => {
      return {
        id: `${product.slug}-gallery-${index + 1}`,
        src,
        alt: `${product.name} gallery image ${index + 1}`,
      };
    });
};

const buildReviews = (product: ProductListItem, seed: number) => {
  return REVIEW_AUTHOR_POOL.slice(0, 4).map((author, index) => {
    const rating = Math.max(4, Math.round(product.rating));

    return {
      id: `${product.slug}-review-${index + 1}`,
      author,
      rating,
      comment:
        index % 2 === 0
          ? `The ${product.name} feels incredibly refined. Typing sound is controlled and premium right out of the box.`
          : `Daily workflow improved noticeably with ${product.name}. Build quality and switch consistency exceeded expectations.`,
      createdAtLabel:
        REVIEW_TIME_POOL[(seed + index) % REVIEW_TIME_POOL.length],
      helpfulCount: 10 + seed + index,
    };
  });
};

const createProductDetail = (
  product: ProductListItem,
  seed: number
): ProductDetail => {
  const stockStatus =
    product.badge === 'limited'
      ? 'low-stock'
      : product.badge === 'in-stock'
        ? 'in-stock'
        : 'in-stock';

  const stockLabel = stockStatus === 'low-stock' ? 'Limited stock' : 'In Stock';

  const switchOptions = PRODUCT_SWITCH_TYPE_OPTIONS.includes(product.switchType)
    ? PRODUCT_SWITCH_TYPE_OPTIONS
    : [product.switchType, ...PRODUCT_SWITCH_TYPE_OPTIONS];

  return {
    ...product,
    series: `${product.layout} Performance Series`,
    stockStatus,
    stockLabel,
    reviewCount: 90 + seed * 3,
    gallery: buildGallery(product, seed),
    switchOptions,
    colorOptions: COLOR_PRESETS.slice(0, 3),
    defaultSwitch: product.switchType,
    defaultColor: COLOR_PRESETS[0],
    quantityLimit: 2,
    specsHeading: 'Technical Specifications',
    specsDescription: `Engineered without compromise. ${product.name} is tuned for precision feel, reliable durability, and stable acoustics.`,
    technicalSpecs: [
      {
        id: `${product.slug}-spec-build`,
        title: 'Build Construction',
        description:
          'Dual-gasket mount with layered dampening for a focused and balanced typing profile.',
        bullets: [
          `${product.caseMaterial} case architecture`,
          `${product.layout} optimized internal frame`,
          'FR4/PC plate compatibility',
        ],
      },
      {
        id: `${product.slug}-spec-connectivity`,
        title: 'Connectivity',
        description:
          'Tri-mode wireless and low-latency wired mode tuned for productivity and gaming workflows.',
        bullets: [
          'Wired USB-C',
          'Bluetooth multi-device pairing',
          '2.4GHz wireless mode',
        ],
      },
      {
        id: `${product.slug}-spec-aesthetics`,
        title: 'Aesthetics',
        description:
          'Purpose-built details and premium finishing choices for an enthusiast-grade desktop setup.',
        bullets: [
          'Premium finish options',
          'Per-key RGB profiles',
          'Custom badge accents',
        ],
      },
    ],
    materialShowcase: {
      eyebrow: 'Exquisite Materials',
      title: `Forged for ${product.name}`,
      description: `${product.caseMaterial} shell treatment improves scratch resistance while preserving a clean, tactile finish.`,
      samples: [
        {
          id: `${product.slug}-material-1`,
          name: 'Brushed Alloy',
          image: DETAIL_GALLERY_POOL[(seed + 1) % DETAIL_GALLERY_POOL.length],
        },
        {
          id: `${product.slug}-material-2`,
          name: 'Signal Accent',
          image: DETAIL_GALLERY_POOL[(seed + 2) % DETAIL_GALLERY_POOL.length],
        },
      ],
      architectureImage:
        DETAIL_GALLERY_POOL[(seed + 3) % DETAIL_GALLERY_POOL.length],
      architectureTitle: 'Internal Gasket Architecture',
      architectureDescription:
        'An exploded overview of the precision engineering used in our acoustic stack.',
    },
    videoTour: {
      title: 'Build Video & Product Tour',
      description: `Experience ${product.name} in action and hear the signature acoustic profile.`,
      durationLabel: '6:15',
      coverImage: DETAIL_GALLERY_POOL[(seed + 4) % DETAIL_GALLERY_POOL.length],
    },
    reviewsHeading: 'Community Reviews',
    reviews: buildReviews(product, seed),
  };
};

const mk90Override: Partial<ProductDetail> = {
  series: 'Custom Keyboards / Flagship Series',
  specsDescription:
    'Engineered without compromise. Every component of the MK-90 Pro is selected for its performance, durability, and acoustic profile.',
  materialShowcase: {
    eyebrow: 'Exquisite Materials',
    title: 'Forged in Obsidian',
    description:
      'The Midnight Obsidian finish is achieved through a multi-stage treatment process, resulting in a surface that feels dense, clean, and exceptionally durable.',
    samples: [
      {
        id: 'mk-90-material-1',
        name: 'Dual Anodized Alloy',
        image:
          'https://images.unsplash.com/photo-1610397648933-cc6a8f4f7f5f?auto=format&fit=crop&w=1000&q=80',
      },
      {
        id: 'mk-90-material-2',
        name: 'Signal Accent',
        image:
          'https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=1000&q=80',
      },
    ],
    architectureImage:
      'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1400&q=80',
    architectureTitle: 'Internal Gasket Architecture',
    architectureDescription:
      'An exploded view showing the precision engineering of our acoustic stack.',
  },
  videoTour: {
    title: 'Build Video & Product Tour',
    description:
      'Experience the MK-90 Pro in action and hear the signature acoustic profile.',
    durationLabel: '6:15',
    coverImage:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80',
  },
  reviews: [
    {
      id: 'mk-90-review-1',
      author: 'Alex Rivers',
      rating: 5,
      comment:
        'The typing experience on the MK-90 Pro is unparalleled. The gasket mount creates the exact amount of flex, and the sound profile is satisfyingly deep without becoming muddy.',
      createdAtLabel: '2 days ago',
      helpfulCount: 18,
    },
    {
      id: 'mk-90-review-2',
      author: 'Sarah Chen',
      rating: 5,
      comment:
        'Beautiful design and flawless finish. Setup took a few minutes, but once configured it became my favorite daily driver for both coding and writing.',
      createdAtLabel: '1 week ago',
      helpfulCount: 12,
    },
  ],
};

export const productDetailsBySlug: Record<string, ProductDetail> =
  productsCatalog.reduce<Record<string, ProductDetail>>(
    (acc, product, index) => {
      const detail = createProductDetail(product, index + 1);
      const withOverride =
        product.slug === 'mk-90-pro' ? { ...detail, ...mk90Override } : detail;

      acc[product.slug] = withOverride;
      return acc;
    },
    {}
  );
