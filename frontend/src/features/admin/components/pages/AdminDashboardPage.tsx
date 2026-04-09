'use client';

import { useState } from 'react';
import { LayoutGrid } from 'lucide-react';

import {
  AdminCustomersMixCard,
  AdminDashboardHeader,
  AdminDashboardKpis,
  AdminRevenueTrendCard,
  AdminStoreVisitsCard,
  AdminTopProductsCard,
} from '@/features/admin/components/dashboard';
import { useAdminDashboardQuery } from '@/features/admin/hooks';
import type { AdminDashboardPeriod } from '@/features/admin/types/admin-dashboard.types';
import { Spinner } from '@/shared/components/ui/spinner';

export function AdminDashboardPage() {
  const [period, setPeriod] = useState<AdminDashboardPeriod>('30d');
  const dashboardQuery = useAdminDashboardQuery(period);

  const summary = dashboardQuery.data;

  return (
    <div className="space-y-4">
      <AdminDashboardHeader period={period} onPeriodChange={setPeriod} />

      {dashboardQuery.isLoading ? (
        <div className="flex min-h-52 items-center justify-center">
          <Spinner />
        </div>
      ) : null}

      {!dashboardQuery.isLoading && !summary ? (
        <div className="py-12 text-center">
          <LayoutGrid className="text-muted-foreground mx-auto size-8" />
          <p className="text-foreground mt-3 font-semibold">
            Dashboard data is not available
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Try refreshing in a moment to load admin metrics.
          </p>
        </div>
      ) : null}

      {summary ? (
        <div className="space-y-4">
          <AdminDashboardKpis metrics={summary.kpis} />

          <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <AdminRevenueTrendCard points={summary.revenueTrend} />
            <AdminStoreVisitsCard
              visitsTotal={summary.visitsTotal}
              segments={summary.visitsSegments}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <AdminTopProductsCard products={summary.topProducts} />
            <AdminCustomersMixCard
              mixItems={summary.customerMix}
              statusBreakdown={summary.statusBreakdown}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
