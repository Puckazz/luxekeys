import AccountSidebar from '@/features/profile/components/account-sidebar/AccountSidebar';

export default function AccountLayoutShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
        <AccountSidebar />

        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
