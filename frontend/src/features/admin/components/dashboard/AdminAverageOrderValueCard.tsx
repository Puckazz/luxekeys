import { ArrowUpRight, ReceiptText } from 'lucide-react';

import type { AdminDashboardAverageOrderValueMetric } from '@/features/admin/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

type AdminAverageOrderValueCardProps = {
  metric: AdminDashboardAverageOrderValueMetric;
};

export function AdminAverageOrderValueCard({
  metric,
}: AdminAverageOrderValueCardProps) {
  return (
    <Card className="border-border/70 bg-card/35 h-full">
      <CardHeader>
        <CardTitle>Average order value</CardTitle>
        <CardDescription>
          Delivered order value in selected period.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-card/50 border-border/70 rounded-xl border p-4">
          <p className="text-muted-foreground text-xs uppercase">
            Current period
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-2xl font-semibold">{metric.value}</p>
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
              <ReceiptText className="size-4" />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="bg-card/50 border-border/70 rounded-xl border p-4">
            <p className="text-muted-foreground text-xs uppercase">
              Previous period
            </p>
            <p className="mt-2 text-lg font-semibold">
              {metric.previousValue}
            </p>
          </div>

          <div className="bg-card/50 border-border/70 rounded-xl border p-4">
            <p className="text-muted-foreground text-xs uppercase">Change</p>
            <p className="mt-2 flex items-center gap-1 text-lg font-semibold">
              {metric.changeLabel}
              <ArrowUpRight className="size-4" />
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
