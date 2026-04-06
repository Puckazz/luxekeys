import type { Metadata } from 'next';

import { AddressesPage } from '@/features/profile/components/pages';

export const metadata: Metadata = {
  title: 'Addresses | LuxeKeys',
  description: 'Manage your saved delivery addresses.',
};

export default function AddressesRoutePage() {
  return <AddressesPage />;
}
