import { mapCatalogItemToProductListItem } from '@/features/shop/mappers/product-catalog.mapper';
import { accessoriesProductsCatalogRaw } from '@/features/shop/mocks/products.accessories.data';
import { keyboardProductsCatalogRaw } from '@/features/shop/mocks/products.keyboards.data';
import { keycapsProductsCatalogRaw } from '@/features/shop/mocks/products.keycaps.data';
import { switchesProductsCatalogRaw } from '@/features/shop/mocks/products.switches.data';
import { ProductDetail, ProductListItem } from '@/features/shop/types';
import { ProductCatalogItem } from '@/features/shop/types/product-catalog.types';
import { PRODUCT_SWITCH_TYPE_OPTIONS } from '@/features/shop/utils/product-list-options.utils';

export const PRODUCT_LIST_PAGE_SIZE = 6;

const productsCatalogRaw: ProductCatalogItem[] = [
  ...keyboardProductsCatalogRaw,
  ...accessoriesProductsCatalogRaw,
  ...switchesProductsCatalogRaw,
  ...keycapsProductsCatalogRaw,
];

export const productsCatalog: ProductListItem[] = productsCatalogRaw.map(
  (item) => mapCatalogItemToProductListItem(item)
);

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
