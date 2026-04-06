import type { Metadata } from 'next';

import { PersonalInfoPage } from '@/features/profile/components/pages';

export const metadata: Metadata = {
  title: 'Personal Info | LuxeKeys',
  description: 'Update your account profile information.',
};

export default function AccountRoutePage() {
  return <PersonalInfoPage />;
}
