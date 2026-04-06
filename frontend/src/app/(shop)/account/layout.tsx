import type { Metadata } from 'next';

import { AccountLayoutShell } from '@/features/profile/components/account-sidebar';

export const metadata: Metadata = {
  title: 'My Account | LuxeKeys',
  description: 'Manage your personal info, saved addresses, and order history.',
};

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AccountLayoutShell>{children}</AccountLayoutShell>;
}
