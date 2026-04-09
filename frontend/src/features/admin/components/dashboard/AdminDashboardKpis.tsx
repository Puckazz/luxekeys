import {
  CircleDollarSign,
  PackageCheck,
  UserRound,
  UsersRound,
} from 'lucide-react';

import type { AdminDashboardKpiMetric } from '@/features/admin/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type AdminDashboardKpisProps = {
  metrics: AdminDashboardKpiMetric[];
};

const iconByKey = {
  orders: PackageCheck,
  revenue: CircleDollarSign,
  customers: UserRound,
  'store-visits': UsersRound,
} as const;

export function AdminDashboardKpis({ metrics }: AdminDashboardKpisProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = iconByKey[metric.key];

        return (
          <Card key={metric.key} className="border-border/70 bg-card/35">
            <CardContent className="space-y-3 p-4">
              <div className="text-muted-foreground flex items-center justify-between text-sm">
                <span>{metric.label}</span>
                <Icon className="size-4" />
              </div>

              <p className="text-foreground text-2xl leading-none font-semibold">
                {metric.value}
              </p>

              <p className="text-muted-foreground text-xs">
                {metric.changeLabel}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
