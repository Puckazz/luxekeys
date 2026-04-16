import type { Metadata } from 'next';

import { AboutPage } from '@/features/shop/components/pages';

export const metadata: Metadata = {
  title: 'About | LuxeKeys',
  description:
    'Discover the LuxeKeys philosophy behind our premium keyboards, materials, and enthusiast-first curation.',
};

export default function AboutRoutePage() {
  return <AboutPage />;
}
