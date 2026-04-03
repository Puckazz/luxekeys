import {
  CommunityImage,
  CountdownItem,
  FeaturedProduct,
  LabNote,
} from '@/features/shop/types';

export const featuredProducts: FeaturedProduct[] = [
  {
    slug: 'mk-90-pro',
    name: 'Obsidian TKL Pro',
    subtitle: 'Gasket Mount / CNC Aluminum',
    price: '$349.00',
    discountPercentage: 15,
    badge: 'In Stock',
    image:
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'mode-sixtyfive',
    name: 'Ghost 65 Edition',
    subtitle: 'Polycarbonate / RGB Underglow',
    price: '$289.00',
    discountPercentage: 10,
    badge: 'Limited',
    image:
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'wuque-zoom75',
    name: 'Nebula Keycap Set',
    subtitle: 'PBT Doubleshot / Cherry Profile',
    price: '$125.00',
    badge: null,
    image:
      'https://images.unsplash.com/photo-1613141411244-0e4ac259d217?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'tofu60-redux',
    name: 'Cobalt Silent Linears',
    subtitle: 'Lubed & Filmed / 36-pack',
    price: '$42.00',
    badge: null,
    image:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'keychron-q1-pro',
    name: 'Aurora 60 Build Kit',
    subtitle: 'Hotswap / CNC Frame',
    price: '$219.00',
    discountPercentage: 20,
    badge: null,
    image:
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80',
  },
];

export const countdownItems: CountdownItem[] = [
  { value: '04', label: 'DAYS' },
  { value: '12', label: 'HRS' },
  { value: '45', label: 'MINS' },
  { value: '18', label: 'SECS' },
];

export const communityShowcaseImages: CommunityImage[] = [
  {
    image:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1400&q=80',
    alt: 'Custom keyboard build',
  },
  {
    image:
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80',
    alt: 'Compact keyboard',
  },
  {
    image:
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=900&q=80',
    alt: 'Marble desk setup',
  },
  {
    image:
      'https://images.unsplash.com/photo-1613141411244-0e4ac259d217?auto=format&fit=crop&w=900&q=80',
    alt: 'Keycap close-up',
  },
  {
    image:
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80',
    alt: 'White low-profile keyboard',
  },
  {
    image:
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=900&q=80',
    alt: 'Dark custom keyboard',
  },
];

export const labNotes: LabNote[] = [
  {
    category: 'SWITCH GUIDE / TECH',
    title: 'The Ultimate Guide to Linear Switches',
    excerpt:
      "Understand spring weights, stem materials, and why 'thock' is more than just sound.",
    image:
      'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'TOP PICKS',
    title: 'Top 5 TKL Keyboards of 2024',
    excerpt:
      'A curated list for builders who want premium feel without full-size footprint.',
    image:
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'KEYCAP SCIENCE',
    title: 'SA vs Cherry: Choosing a Profile',
    excerpt:
      'Compare sound, comfort, and typing angle to find your best daily-driver profile.',
    image:
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=80',
  },
];
