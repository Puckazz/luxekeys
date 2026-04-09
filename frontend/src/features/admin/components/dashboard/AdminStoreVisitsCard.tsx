import { ArrowUpRight } from 'lucide-react';

import type { AdminDashboardVisitsSegment } from '@/features/admin/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

type AdminStoreVisitsCardProps = {
  visitsTotal: number;
  segments: AdminDashboardVisitsSegment[];
};

const numberFormatter = new Intl.NumberFormat('en-US');

export function AdminStoreVisitsCard({
  visitsTotal,
  segments,
}: AdminStoreVisitsCardProps) {
  const maxValue = Math.max(1, ...segments.map((segment) => segment.value));

  return (
    <Card className="border-border/70 bg-card/35 h-full">
      <CardHeader>
        <CardTitle>Store visits</CardTitle>
        <CardDescription>
          Traffic composition in selected period.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-card/50 border-border/70 rounded-xl border p-4">
          <p className="text-muted-foreground text-xs uppercase">
            Total visits
          </p>
          <p className="text-xl font-semibold">
            {numberFormatter.format(visitsTotal)}
          </p>
        </div>

        <div className="space-y-3">
          {segments.map((segment, index) => {
            const widthPercent = Math.round((segment.value / maxValue) * 100);
            const barColor =
              index === 0
                ? 'bg-[var(--chart-2)]'
                : index === 1
                  ? 'bg-[var(--chart-1)]'
                  : 'bg-[var(--chart-5)]';

            return (
              <div key={segment.label} className="space-y-1.5">
                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span>{segment.label}</span>
                  <span className="text-foreground flex items-center gap-1 font-medium">
                    {segment.trendLabel}
                    <ArrowUpRight className="size-3" />
                  </span>
                </div>

                <div className="bg-input/60 h-2.5 rounded-full">
                  <div
                    className={`${barColor} h-2.5 rounded-full transition-all`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
