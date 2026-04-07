import { AdminLayoutShell } from '@/features/admin/components/common/AdminLayoutShell';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
