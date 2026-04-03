import ShopLayoutShell from '../../shared/components/layout/ShopLayoutShell';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ShopLayoutShell>{children}</ShopLayoutShell>;
}
